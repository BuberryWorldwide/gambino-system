const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS and JSON parsing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gambino', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  walletAddress: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true }, // Encrypted
  gambinoBalance: { type: Number, default: 0 },
  gluckScore: { type: Number, default: 0 },
  tier: { type: String, enum: ['none', 'tier3', 'tier2', 'tier1'], default: 'none' },
  totalJackpots: { type: Number, default: 0 },
  majorJackpots: { type: Number, default: 0 },
  minorJackpots: { type: Number, default: 0 },
  machinesPlayed: [String], // Track which machines they've played
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
});

// Add indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ gluckScore: -1 });
userSchema.index({ walletAddress: 1 });

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['purchase', 'jackpot', 'burn', 'tier_reward'], required: true },
  amount: { type: Number, required: true },
  usdAmount: { type: Number }, // USD equivalent at time of transaction
  machineId: String,
  txHash: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  gluckScoreChange: { type: Number, default: 0 },
  metadata: { type: Object }, // Additional transaction data
  createdAt: { type: Date, default: Date.now }
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

// Machine Schema
const machineSchema = new mongoose.Schema({
  machineId: { type: String, required: true, unique: true },
  location: String,
  status: { type: String, enum: ['active', 'maintenance', 'offline'], default: 'active' },
  totalPlays: { type: Number, default: 0 },
  totalJackpots: { type: Number, default: 0 },
  totalPayout: { type: Number, default: 0 },
  lastMaintenance: Date,
  createdAt: { type: Date, default: Date.now }
});

const Machine = mongoose.model('Machine', machineSchema);

// Helper function to generate wallet address (simplified for demo)
const generateWalletAddress = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to calculate Glück Score
const calculateGluckScore = (majorJackpots, minorJackpots, machinesPlayed) => {
  let baseScore = (majorJackpots * 1000) + (minorJackpots * 100);
  
  // Multiplier for playing different machines
  const uniqueMachines = new Set(machinesPlayed).size;
  let diversityMultiplier = 1.0;
  
  if (uniqueMachines >= 7) diversityMultiplier = 3.0;
  else if (uniqueMachines >= 5) diversityMultiplier = 2.5;
  else if (uniqueMachines >= 3) diversityMultiplier = 2.0;
  else if (uniqueMachines >= 2) diversityMultiplier = 1.5;
  
  return Math.floor(baseScore * diversityMultiplier);
};

// Helper function to determine tier
const determineTier = (majorJackpots, minorJackpots, machinesPlayed) => {
  const uniqueMachines = new Set(machinesPlayed).size;
  
  // Tier 1: 7+ major jackpots across 3+ machines
  if (majorJackpots >= 7 && uniqueMachines >= 3) return 'tier1';
  
  // Tier 2: 1-2 majors + multiple minors with machine spread
  if ((majorJackpots >= 1 && minorJackpots >= 10 && uniqueMachines >= 2) || 
      (majorJackpots >= 2)) return 'tier2';
  
  // Tier 3: 50+ minor jackpots or consistent play
  if (minorJackpots >= 50 || (minorJackpots >= 20 && uniqueMachines >= 2)) return 'tier3';
  
  return 'none';
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Create new user account and wallet
app.post('/api/users/create', async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate wallet address (simplified)
    const walletAddress = generateWalletAddress();

    // Generate and encrypt private key
    const privateKey = generateWalletAddress(); // Simplified
    const encryptedPrivateKey = await bcrypt.hash(privateKey, 10);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      phone,
      walletAddress,
      privateKey: encryptedPrivateKey,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, walletAddress }, 
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log(`✅ New user created: ${email}`);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress,
        gambinoBalance: user.gambinoBalance,
        gluckScore: user.gluckScore,
        tier: user.tier
      },
      token
    });
  } catch (error) {
    console.error('❌ User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress }, 
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log(`🔐 User logged in: ${email}`);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress,
        gambinoBalance: user.gambinoBalance,
        gluckScore: user.gluckScore,
        tier: user.tier,
        totalJackpots: user.totalJackpots,
        majorJackpots: user.majorJackpots,
        minorJackpots: user.minorJackpots
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress,
        gambinoBalance: user.gambinoBalance,
        gluckScore: user.gluckScore,
        tier: user.tier,
        totalJackpots: user.totalJackpots,
        majorJackpots: user.majorJackpots,
        minorJackpots: user.minorJackpots,
        machinesPlayed: user.machinesPlayed,
        createdAt: user.createdAt,
        lastActivity: user.lastActivity
      }
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Purchase GAMBINO tokens
app.post('/api/tokens/purchase', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body; // amount in USD

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Current GAMBINO price (you'd get this from your pricing oracle)
    const currentPrice = 0.001; // $0.001 per GAMBINO
    const tokensToMint = Math.floor(amount / currentPrice);

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'purchase',
      amount: tokensToMint,
      usdAmount: amount,
      status: 'pending',
      metadata: { paymentMethod, pricePerToken: currentPrice }
    });

    await transaction.save();

    // In production, you'd integrate with payment processor here
    // For now, simulate successful payment

    // Update user balance
    user.gambinoBalance += tokensToMint;
    user.lastActivity = new Date();
    await user.save();

    // Update transaction status
    transaction.status = 'completed';
    transaction.txHash = `purchase_${Date.now()}_${user._id}`;
    await transaction.save();

    console.log(`💰 Token purchase: ${user.email} bought ${tokensToMint} GAMBINO for $${amount}`);

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        tokensReceived: tokensToMint,
        pricePerToken: currentPrice,
        totalPaid: amount
      },
      newBalance: user.gambinoBalance
    });
  } catch (error) {
    console.error('❌ Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Process jackpot win
app.post('/api/gaming/jackpot', authenticateToken, async (req, res) => {
  try {
    const { machineId, jackpotType, tokensWon } = req.body;

    if (!machineId || !jackpotType || !tokensWon) {
      return res.status(400).json({ error: 'Machine ID, jackpot type, and tokens won are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add machine to played list if not already there
    if (!user.machinesPlayed.includes(machineId)) {
      user.machinesPlayed.push(machineId);
    }

    // Update jackpot counts
    if (jackpotType === 'major') {
      user.majorJackpots += 1;
    } else {
      user.minorJackpots += 1;
    }
    user.totalJackpots += 1;

    // Calculate new Glück Score
    const newGluckScore = calculateGluckScore(user.majorJackpots, user.minorJackpots, user.machinesPlayed);
    const gluckScoreIncrease = newGluckScore - user.gluckScore;
    user.gluckScore = newGluckScore;

    // Update tier
    const oldTier = user.tier;
    user.tier = determineTier(user.majorJackpots, user.minorJackpots, user.machinesPlayed);

    // Add tokens to balance
    user.gambinoBalance += tokensWon;
    user.lastActivity = new Date();
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'jackpot',
      amount: tokensWon,
      machineId,
      status: 'completed',
      gluckScoreChange: gluckScoreIncrease,
      txHash: `jackpot_${Date.now()}_${user._id}`,
      metadata: { 
        jackpotType, 
        oldTier, 
        newTier: user.tier,
        uniqueMachines: new Set(user.machinesPlayed).size
      }
    });

    await transaction.save();

    // Update machine stats
    await Machine.findOneAndUpdate(
      { machineId },
      { 
        $inc: { totalPlays: 1, totalJackpots: 1, totalPayout: tokensWon },
        $set: { status: 'active' }
      },
      { upsert: true }
    );

    console.log(`🎰 JACKPOT! ${user.email} won ${tokensWon} GAMBINO on machine ${machineId}`);

    res.json({
      success: true,
      jackpot: {
        type: jackpotType,
        tokensWon,
        newBalance: user.gambinoBalance,
        gluckScoreIncrease,
        newGluckScore: user.gluckScore,
        oldTier,
        newTier: user.tier,
        tierUpgrade: user.tier !== oldTier,
        totalJackpots: user.totalJackpots,
        uniqueMachines: new Set(user.machinesPlayed).size
      }
    });
  } catch (error) {
    console.error('❌ Jackpot processing error:', error);
    res.status(500).json({ error: 'Failed to process jackpot' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: true })
      .sort({ gluckScore: -1 })
      .limit(100)
      .select('email gluckScore tier totalJackpots majorJackpots minorJackpots machinesPlayed createdAt');

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
      gluckScore: user.gluckScore,
      tier: user.tier,
      totalJackpots: user.totalJackpots,
      majorJackpots: user.majorJackpots,
      minorJackpots: user.minorJackpots,
      uniqueMachines: new Set(user.machinesPlayed).size,
      memberSince: user.createdAt
    }));

    res.json({
      success: true,
      leaderboard,
      totalPlayers: await User.countDocuments({ isActive: true })
