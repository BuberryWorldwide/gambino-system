require('dotenv').config({ path: '/opt/gambino/.env' });
const WalletService = require('./backend/src/services/walletService');
const { Keypair } = require('@solana/web3.js');

console.log('🧪 TESTING WALLET GENERATION');
console.log('============================');

// Test your current WalletService
const walletService = new WalletService();
console.log('\n1. Your WalletService:');
try {
  const wallet1 = walletService.generateWallet();
  console.log('Generated wallet:', wallet1.publicKey);
  console.log('Length:', wallet1.publicKey.length);
  console.log('Contains invalid chars:', !/^[A-HJ-NP-Z1-9]+$/.test(wallet1.publicKey));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test real Solana wallet generation
console.log('\n2. Real Solana Wallet:');
const realKeypair = Keypair.generate();
console.log('Real wallet:', realKeypair.publicKey.toString());
console.log('Length:', realKeypair.publicKey.toString().length);
console.log('Valid base58:', /^[A-HJ-NP-Z1-9]+$/.test(realKeypair.publicKey.toString()));
