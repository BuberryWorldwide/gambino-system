require('dotenv').config({ path: '/opt/gambino/.env' });
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const { Connection, PublicKey } = require('@solana/web3.js');

async function checkRecentUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔍 CHECKING ALL RECENT USERS');
    console.log('=============================');
    
    // Get the 3 most recent users
    const users = await User.find({}).sort({ createdAt: -1 }).limit(3);
    
    for (const user of users) {
      console.log(`\n👤 USER: ${user.email}`);
      console.log(`Created: ${user.createdAt}`);
      console.log(`Database GAMBINO: ${user.gambinoBalance || 0}`);
      console.log(`Wallet Address: ${user.walletAddress || 'NONE'}`);
      console.log(`Has Private Key: ${!!user.encryptedPrivateKey || !!user.privateKey}`);
      console.log(`Has Recovery Phrase: ${!!user.recoveryPhrase}`);
      
      if (user.walletAddress) {
        try {
          const pubkey = new PublicKey(user.walletAddress);
          console.log('✅ Valid Solana address');
        } catch (err) {
          console.log(`❌ Invalid address: ${err.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkRecentUsers();
