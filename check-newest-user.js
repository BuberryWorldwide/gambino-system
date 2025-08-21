require('dotenv').config({ path: '/opt/gambino/.env' });
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');

async function checkNewestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
    const gambinoMint = new PublicKey(process.env.GAMBINO_MINT_ADDRESS);
    
    console.log('🔍 CHECKING NEWEST USER');
    console.log('=======================');
    
    // Get the most recent user
    const user = await User.findOne({}).sort({ createdAt: -1 });
    
    if (!user) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`\n👤 NEWEST USER: ${user.email}`);
    console.log(`Created: ${user.createdAt}`);
    console.log(`Database GAMBINO: ${user.gambinoBalance || 0}`);
    console.log(`Wallet Address: ${user.walletAddress || 'NONE'}`);
    console.log(`Has Private Key: ${!!user.encryptedPrivateKey}`);
    console.log(`Has Recovery Phrase: ${!!user.recoveryPhrase}`);
    
    if (user.walletAddress) {
      try {
        // Validate the address
        const pubkey = new PublicKey(user.walletAddress);
        console.log('✅ Valid Solana address format');
        
        // Check SOL balance
        const solBalance = await connection.getBalance(pubkey);
        console.log(`Real SOL Balance: ${(solBalance / 1e9).toFixed(6)}`);
        
        // Check GAMBINO token balance
        try {
          const tokenAccount = await getAssociatedTokenAddress(gambinoMint, pubkey);
          console.log(`Expected Token Account: ${tokenAccount.toString()}`);
          
          const tokenAccountInfo = await getAccount(connection, tokenAccount);
          const realTokenBalance = Number(tokenAccountInfo.amount) / 1e6;
          console.log(`✅ Real GAMBINO Balance: ${realTokenBalance}`);
          
        } catch (tokenErr) {
          console.log(`❌ No token account exists (${tokenErr.message})`);
          console.log('💡 User needs token account created and tokens sent');
        }
        
      } catch (err) {
        console.log(`❌ Invalid wallet address: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkNewestUser();
