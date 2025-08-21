require('dotenv').config({ path: '/opt/gambino/.env' });
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');

async function checkUserWallets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
    const gambinoMint = new PublicKey(process.env.GAMBINO_MINT_ADDRESS);
    
    console.log('🔍 CHECKING USER WALLETS');
    console.log('========================');
    
    const users = await User.find({}).limit(5).sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    for (const user of users) {
      console.log(`\n👤 USER: ${user.email}`);
      console.log(`Database GAMBINO Balance: ${user.gambinoBalance || 0}`);
      console.log(`Wallet Address: ${user.walletAddress || 'NONE'}`);
      
      if (user.walletAddress) {
        try {
          // Check SOL balance
          const solBalance = await connection.getBalance(new PublicKey(user.walletAddress));
          console.log(`Real SOL Balance: ${(solBalance / 1e9).toFixed(6)}`);
          
          // Check GAMBINO token balance
          try {
            const tokenAccount = await getAssociatedTokenAddress(gambinoMint, new PublicKey(user.walletAddress));
            const tokenAccountInfo = await getAccount(connection, tokenAccount);
            const realTokenBalance = Number(tokenAccountInfo.amount) / 1e6;
            console.log(`Real GAMBINO Balance: ${realTokenBalance}`);
            console.log(`Token Account: ${tokenAccount.toString()}`);
          } catch (err) {
            console.log(`Real GAMBINO Balance: 0 (no token account created)`);
          }
        } catch (err) {
          console.log(`❌ Invalid wallet address: ${err.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserWallets();
