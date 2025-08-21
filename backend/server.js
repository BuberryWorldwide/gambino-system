require('dotenv').config({ path: '/opt/gambino/.env' });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const GambinoTokenService = require('./src/services/gambinoTokenService');

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🔧 ENV loaded. FRONTEND_URL:', process.env.FRONTEND_URL);

// Security + utils
app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// CORS + JSON
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Connect DB
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gambino', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('📦 MongoDB connected');
};

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true },
  walletAddress: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true },
// Add role field
  role: { 
    type: String, 
    enum: ['user', 'store_manager', 'store_owner', 'super_admin'], 
    default: 'user' 
  },
  


  gambinoBalance: { type: Number, default: 0 },
  gluckScore: { type: Number, default: 0 },
  tier: { type: String, enum: ['none', 'tier3', 'tier2', 'tier1'], default: 'none' },
  totalJackpots: { type: Number, default: 0 },
  majorJackpots: { type: Number, default: 0 },
  minorJackpots: { type: Number, default: 0 },
  machinesPlayed: [String],
  favoriteLocation: String,
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ gluckScore: -1 });
const User = mongoose.model('User', userSchema);
const gambinoService = new GambinoTokenService();


// ===== Transaction Schema =====
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['purchase', 'jackpot', 'burn', 'tier_reward'], required: true },
  amount: { type: Number, required: true },
  usdAmount: Number,
  machineId: String,
  txHash: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  gluckScoreChange: { type: Number, default: 0 },
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
const Transaction = mongoose.model('Transaction', transactionSchema);

// Helper functions
const generateWalletAddress = () => {
  const { Keypair } = require('@solana/web3.js');
  const keypair = Keypair.generate();
  return keypair.publicKey.toString();
};

const calculateGluckScore = (majorJackpots, minorJackpots, machinesPlayed) => {
  const base = majorJackpots * 1000 + minorJackpots * 100;
  const unique = new Set(machinesPlayed).size;
  const mult = unique >= 7 ? 3 : unique >= 5 ? 2.5 : unique >= 3 ? 2 : unique >= 2 ? 1.5 : 1;
  return Math.floor(base * mult);
};

const determineTier = (majorJackpots, minorJackpots, machinesPlayed) => {
  const unique = new Set(machinesPlayed).size;
  if (majorJackpots >= 7 && unique >= 3) return 'tier1';
  if ((majorJackpots >= 1 && minorJackpots >= 10 && unique >= 2) || majorJackpots >= 2) return 'tier2';
  if (minorJackpots >= 50 || (minorJackpots >= 20 && unique >= 2)) return 'tier3';
  return 'none';
};

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Temporary session storage for onboarding
const temporaryUsers = new Map();
const generateTempToken = () =>
  jwt.sign({ temp: true, ts: Date.now() }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});


const blockchainTreasuryRoutes = require('./src/routes/blockchainTreasuryRoutes');


// Onboarding Step 1
app.post('/api/onboarding/step1', async (req, res) => {
// Blockchain Treasury Routes\napp.get("/api/blockchain-treasury/balances", (req, res) => {\n  const adminKey = req.headers["x-admin-key"];\n  const expectedKey = process.env.ADMIN_API_KEY || "your-admin-api-key-change-this";\n  \n  if (adminKey !== expectedKey) {\n    return res.status(401).json({ error: "Admin access required" });\n  }\n  \n  res.json({ success: true, message: "Treasury balances endpoint working" });\n});
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName) return res.status(400).json({ success: false, error: 'First/last name required' });
    if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'Valid email required' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, error: 'Password ≥ 6 chars' });

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ success: false, error: 'Account already exists' });
    }

    const walletAddress = generateWalletAddress();
    const privateKey = generateWalletAddress();
    const encryptedPrivateKey = await bcrypt.hash(privateKey, 10);
    const hashedPassword = await bcrypt.hash(password, 12);

    const tempToken = generateTempToken();
    temporaryUsers.set(tempToken, {
      step: 1,
      firstName, lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      walletAddress,
      privateKey: encryptedPrivateKey,
      createdAt: new Date()
    });

    console.log(`✅ Onboarding step1 OK: ${email}`);
    res.json({ success: true, message: 'Step 1 saved', tempToken, walletAddress });
  } catch (e) {
    console.error('❌ Step1 error:', e);
    res.status(500).json({ success: false, error: 'Failed to process step 1' });
  }
});

// Onboarding Step 2
app.post('/api/onboarding/step2', async (req, res) => {
  try {
    const tempToken = req.headers.authorization?.split(' ')[1];
    const { storeId, agreedToTerms, marketingConsent } = req.body;

    if (!tempToken || !temporaryUsers.has(tempToken)) {
      return res.status(401).json({ success: false, error: 'Invalid/expired session' });
    }
    if (!storeId) return res.status(400).json({ success: false, error: 'Store selection required' });
    if (!agreedToTerms) return res.status(400).json({ success: false, error: 'You must agree to the terms' });

    const userData = temporaryUsers.get(tempToken);
    userData.step = 2;
    userData.storeId = storeId;
    userData.agreedToTerms = true;
    userData.marketingConsent = !!marketingConsent;
    temporaryUsers.set(tempToken, userData);

    console.log(`🏪 Onboarding step2 OK: ${userData.email} -> ${storeId}`);
    res.json({ success: true, message: 'Step 2 saved', selectedStore: storeId });
  } catch (e) {
    console.error('❌ Step2 error:', e);
    res.status(500).json({ success: false, error: 'Failed to process step 2' });
  }
});

// Onboarding Step 3
app.post('/api/onboarding/step3', async (req, res) => {
  try {
    const tempToken = req.headers.authorization?.split(' ')[1];
    const { depositAmount, paymentMethod } = req.body;

    if (!tempToken || !temporaryUsers.has(tempToken)) {
      return res.status(401).json({ success: false, error: 'Invalid/expired session' });
    }
    if (!depositAmount || depositAmount < 10) {
      return res.status(400).json({ success: false, error: 'Minimum deposit is $10' });
    }

    const userData = temporaryUsers.get(tempToken);
    const price = 0.001;
    const tokens = Math.floor(depositAmount / price);

    // Create the real user
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      walletAddress: userData.walletAddress,
      privateKey: userData.privateKey,
      favoriteLocation: userData.storeId,
      isVerified: true,
      gambinoBalance: tokens
    });

    // Send real GAMBINO tokens from Community Rewards treasury
    console.log('💰 User created with real wallet:', user.walletAddress);
    console.log('🏗️ Creating token account for user...');
    
    try {
      // First create token account for the user
      const tokenAccountResult = await gambinoService.createUserTokenAccount(user.walletAddress);
      if (!tokenAccountResult.success) {
        console.log('⚠️ Failed to create token account, skipping token distribution');
        throw new Error('Token account creation failed: ' + tokenAccountResult.error);
      }
      console.log('✅ Token account created:', tokenAccountResult.tokenAccount);
      
      console.log('🎁 Sending', tokens, 'GAMBINO tokens from treasury...');
      const rewardResult = await gambinoService.distributeRegistrationReward(
        user._id,
        user.walletAddress,
        'userRegistration'
      );
      
      if (rewardResult.success) {
        console.log('✅ Sent', rewardResult.amount, 'GAMBINO tokens to', user.walletAddress);
        console.log('🔗 Transaction:', rewardResult.transaction);
      } else {
        console.error('❌ Failed to send tokens:', rewardResult.error);
        // Don't fail registration if token distribution fails
      }
    } catch (tokenError) {
      console.error('❌ Token distribution error:', tokenError.message);
      // Continue with registration even if token transfer fails
    }

    await Transaction.create({
      userId: user._id,
      type: 'purchase',
      amount: tokens,
      usdAmount: depositAmount,
      status: 'completed',
      txHash: `onboarding_${Date.now()}_${user._id}`,
      metadata: { paymentMethod, pricePerToken: price, onboardingDeposit: true }
    });

    temporaryUsers.delete(tempToken);

    const accessToken = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress, tier: user.tier },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log(`🎉 Onboarding complete: ${user.email} — ${tokens} GAMBINO`);
    res.json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
          gambinoBalance: user.gambinoBalance,
          gluckScore: user.gluckScore,
          tier: user.tier
        },
        tokensReceived: tokens,
        pricePerToken: price,
        totalPaid: depositAmount
      },
      accessToken
    });
  } catch (e) {
    console.error('❌ Step3 error:', e);
    res.status(500).json({ success: false, error: 'Failed to complete onboarding' });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    user.lastActivity = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
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
  } catch (e) {
    console.error('❌ Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});


// Simple admin login (temporary)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Check if user has admin role
    if (!['store_manager', 'store_owner', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied - insufficient permissions' });
    }
    
    const adminToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Admin login successful',
      token: adminToken,
      admin: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});






// Admin middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Admin token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err || !decoded.role === 'admin') {
      return res.status(403).json({ error: 'Admin access denied' });
    }
    req.admin = decoded;
    next();
  });
};


// Admin metrics endpoint
app.get('/api/admin/metrics', async (req, res) => {
  try {
    if (req.headers['admin-key'] !== (process.env.ADMIN_KEY || 'admin123')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { timeframe = '7d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch(timeframe) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const [recentTransactions, recentUsers] = await Promise.all([
      Transaction.find({ createdAt: { $gte: startDate } }),
      User.find({ createdAt: { $gte: startDate } })
    ]);

    const metrics = {
      timeframe,
      totalTransactions: recentTransactions.length,
      totalVolume: recentTransactions.reduce((sum, tx) => sum + (tx.usdAmount || 0), 0),
      avgTransactionSize: recentTransactions.length > 0 ? 
        recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) / recentTransactions.length : 0,
      newUsers: recentUsers.length,
      purchaseTransactions: recentTransactions.filter(tx => tx.type === 'purchase').length,
      jackpotTransactions: recentTransactions.filter(tx => tx.type === 'jackpot').length
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('❌ Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});


// Change password (admin or user)
app.post('/api/users/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedNewPassword;
    user.lastActivity = new Date();
    await user.save();
    
    console.log(`✅ Password changed for: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Admin password reset (super admin only)
app.post('/api/admin/reset-user-password', authenticateAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    // Only super admins can reset passwords
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can reset passwords' });
    }
    
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedPassword;
    user.lastActivity = new Date();
    await user.save();
    
    console.log(`✅ Admin ${req.admin.email} reset password for: ${user.email}`);
    
    res.json({
      success: true,
      message: `Password reset for ${user.email}`
    });
    
  } catch (error) {
    console.error('❌ Admin password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// User profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

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
  } catch (e) {
    console.error('❌ Profile error:', e);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Token purchase
app.post('/api/tokens/purchase', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const price = 0.001;
    const tokens = Math.floor(amount / price);

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'purchase',
      amount: tokens,
      usdAmount: amount,
      status: 'completed',
      txHash: `purchase_${Date.now()}_${user._id}`,
      metadata: { pricePerToken: price }
    });

    user.gambinoBalance += tokens;
    user.lastActivity = new Date();
    await user.save();

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        tokensReceived: tokens,
        pricePerToken: price,
        totalPaid: amount
      },
      newBalance: user.gambinoBalance
    });
  } catch (e) {
    console.error('❌ Purchase error:', e);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: true })
      .sort({ gluckScore: -1 })
      .limit(100)
      .select('email gluckScore tier totalJackpots majorJackpots minorJackpots machinesPlayed createdAt');

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
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
    });
  } catch (e) {
    console.error('❌ Leaderboard error:', e);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.use('/api/blockchain-treasury', blockchainTreasuryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});



// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});



// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🎰 Gambino Backend running on port ${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
    });
  } catch (e) {
    console.error('❌ Failed to start server:', e);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM: closing DB');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
