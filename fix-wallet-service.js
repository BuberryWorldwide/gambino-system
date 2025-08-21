// Test what your current WalletService is doing wrong
const WalletService = require('./backend/src/services/walletService');
const { Keypair } = require('@solana/web3.js');

console.log('🔍 DEBUGGING WALLET SERVICE');
console.log('===========================');

const walletService = new WalletService();

// Test 5 wallets from your service
console.log('\nYour WalletService outputs:');
for (let i = 0; i < 3; i++) {
  const wallet = walletService.generateWallet();
  console.log(`${i+1}. ${wallet.publicKey}`);
  console.log(`   Length: ${wallet.publicKey.length}`);
  console.log(`   Has 0: ${wallet.publicKey.includes('0')}`);
  console.log(`   Has O: ${wallet.publicKey.includes('O')}`);
}

// Test real Solana generation
console.log('\nReal Solana generation:');
for (let i = 0; i < 3; i++) {
  const keypair = Keypair.generate();
  const address = keypair.publicKey.toString();
  console.log(`${i+1}. ${address}`);
  console.log(`   Length: ${address.length}`);
  console.log(`   Has 0: ${address.includes('0')}`);
  console.log(`   Has O: ${address.includes('O')}`);
}
