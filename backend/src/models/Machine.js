// Create this file: backend/src/models/Machine.js
const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  // Machine Identification
  machineId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Store Assignment
  storeId: {
    type: String,
    required: true,
    ref: 'Store'
  },
  
  // Machine Details
  gameType: {
    type: String,
    required: true,
    enum: [
      'NCG Skills 1', 'NCG Skills 2', 'NCG Skills 3', 'NCG Skills 4', 'NCG Skills 5',
      'FireLink', 'Superior Skills 1', 'Superior Skills 2', 'Superior Skills 3',
      'Lightning Link', 'Dragon Link', 'Lock It Link'
    ]
  },
  manufacturer: {
    type: String,
    default: 'Aristocrat'
  },
  model: {
    type: String,
    trim: true
  },
  
  // Physical Location
  location: {
    type: String,
    required: true,
    trim: true // e.g., "Front Counter", "Back Wall", "Side Counter"
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'out_of_order'],
    default: 'active'
  },
  connectionStatus: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  
  // Financial Tracking
  cashBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  jackpotPool: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Performance Metrics
  totalPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPayout: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastMaintenance: {
    type: Date
  },
  
  // Settings
  settings: {
    maxBet: {
      type: Number,
      default: 10,
      min: 0.01
    },
    minBet: {
      type: Number,
      default: 0.01,
      min: 0.01
    },
    jackpotThreshold: {
      type: Number,
      default: 1000
    },
    autoPayoutLimit: {
      type: Number,
      default: 500
    }
  },
  
  // Maintenance Log
  maintenanceLog: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['routine', 'repair', 'cleaning', 'update', 'calibration']
    },
    description: String,
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    cost: {
      type: Number,
      min: 0
    }
  }],
  
  // Installation Details
  installDate: {
    type: Date,
    default: Date.now
  },
  warrantyExpiry: {
    type: Date
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for performance
machineSchema.index({ machineId: 1 });
machineSchema.index({ storeId: 1 });
machineSchema.index({ serialNumber: 1 });
machineSchema.index({ status: 1 });
machineSchema.index({ connectionStatus: 1 });
machineSchema.index({ lastActivity: -1 });

// Methods
machineSchema.methods.toSafeObject = function() {
  const machine = this.toObject();
  // Remove sensitive internal data if needed
  return machine;
};

machineSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

machineSchema.methods.addMaintenanceLog = function(type, description, technicianId, cost = 0) {
  this.maintenanceLog.push({
    type,
    description,
    technicianId,
    cost
  });
  this.lastMaintenance = new Date();
  return this.save();
};

// Static methods
machineSchema.statics.generateMachineId = function(storeId, gameType) {
  // Generate machine ID like GMB-001, GMB-002, etc.
  const prefix = 'GMB';
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${randomNum}`;
};

// Calculate revenue percentage
machineSchema.methods.getRevenuePercentage = function() {
  if (this.totalPlayed === 0) return 0;
  return ((this.totalPlayed - this.totalPayout) / this.totalPlayed) * 100;
};

// Check if machine needs maintenance
machineSchema.methods.needsMaintenance = function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return !this.lastMaintenance || this.lastMaintenance < thirtyDaysAgo;
};

// Virtual for profit
machineSchema.virtual('profit').get(function() {
  return this.totalPlayed - this.totalPayout;
});

// Validation
machineSchema.pre('save', function(next) {
  // Validate machine ID format
  if (this.machineId && !/^[A-Z0-9-]+$/.test(this.machineId)) {
    next(new Error('Machine ID can only contain uppercase letters, numbers, and hyphens'));
    return;
  }
  
  // Ensure payout doesn't exceed total played
  if (this.totalPayout > this.totalPlayed) {
    next(new Error('Total payout cannot exceed total played'));
    return;
  }
  
  next();
});

module.exports = mongoose.model('Machine', machineSchema);
