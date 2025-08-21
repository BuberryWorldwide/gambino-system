// Create this file: backend/src/models/Store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  // Basic Store Information
  storeId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Location Information
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  // Management
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  managerEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'pending'],
    default: 'active'
  },
  
  // Store Settings
  settings: {
    // Operating Hours
    operatingHours: {
      monday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '09:00' },
        close: { type: String, default: '21:00' }
      },
      tuesday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '09:00' },
        close: { type: String, default: '21:00' }
      },
      wednesday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '09:00' },
        close: { type: String, default: '21:00' }
      },
      thursday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '09:00' },
        close: { type: String, default: '21:00' }
      },
      friday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '09:00' },
        close: { type: String, default: '21:00' }
      },
      saturday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '09:00' },
        close: { type: String, default: '21:00' }
      },
      sunday: {
        isOpen: { type: Boolean, default: true },
        open: { type: String, default: '10:00' },
        close: { type: String, default: '20:00' }
      }
    },
    
    // Machine Settings
    maxMachines: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    
    // Feature Flags
    enableCashConversion: {
      type: Boolean,
      default: true
    },
    requireIdVerification: {
      type: Boolean,
      default: true
    },
    enableLoyaltyProgram: {
      type: Boolean,
      default: true
    },
    
    // Financial Settings
    cashConversionRate: {
      type: Number,
      default: 0.001, // $0.001 per GAMBINO token
      min: 0.0001,
      max: 1
    },
    minimumCashConversion: {
      type: Number,
      default: 1, // $1 minimum
      min: 0.01
    },
    maximumCashConversion: {
      type: Number,
      default: 500, // $500 maximum per transaction
      min: 1
    },
    
    // Internal Notes (admin only)
    internalNotes: {
      type: String,
      default: ''
    },
    
    // API Keys and Integrations
    apiKeys: {
      posSystem: String,
      paymentProcessor: String
    }
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
storeSchema.index({ storeId: 1 });
storeSchema.index({ ownerId: 1 });
storeSchema.index({ city: 1, state: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ createdAt: -1 });

// Methods
storeSchema.methods.toSafeObject = function() {
  const store = this.toObject();
  // Remove sensitive information
  if (store.settings) {
    delete store.settings.apiKeys;
    delete store.settings.internalNotes;
  }
  return store;
};

// Static method to generate store ID
storeSchema.statics.generateStoreId = function(storeName, city, state) {
  const cityCode = city.toLowerCase().replace(/[^a-z]/g, '').substring(0, 4);
  const stateCode = state.toLowerCase();
  const nameCode = storeName.toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/gaming|store|shop/g, '')
    .substring(0, 6);
  
  const randomNum = Math.floor(Math.random() * 900) + 100;
  
  return `${cityCode}_${nameCode}_${randomNum}`;
};

// Validation
storeSchema.pre('save', function(next) {
  // Validate store ID format
  if (this.storeId && !/^[a-z0-9_]+$/.test(this.storeId)) {
    next(new Error('Store ID can only contain lowercase letters, numbers, and underscores'));
    return;
  }
  
  // Validate phone number format if provided
  if (this.phone && !/^\d{3}-\d{3}-\d{4}$/.test(this.phone)) {
    // Auto-format phone number
    const digits = this.phone.replace(/\D/g, '');
    if (digits.length === 10) {
      this.phone = `${digits.substring(0,3)}-${digits.substring(3,6)}-${digits.substring(6)}`;
    }
  }
  
  next();
});

module.exports = mongoose.model('Store', storeSchema);
