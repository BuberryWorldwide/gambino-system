require('dotenv').config({ path: '/opt/gambino/.env' });
const WalletService = require('./backend/src/services/walletService');
const { PublicKey } = require('@solana/web3.js');

console.log('🔍 TRACING ONBOARDING STEP BY STEP');
console.log('==================================');

const walletService = new WalletService();

// Step 1: Generate wallet exactly like onboarding does
console.log('\n1. Generate wallet:');
const wallet = walletService.generateWallet();
console.log('Generated:', wallet.publicKey);

try {
  const pubkey = new PublicKey(wallet.publicKey);
  console.log('✅ Valid after generation');
} catch (error) {
  console.log('❌ Invalid after generation:', error.message);
}

// Step 2: Test encryption (this might corrupt it)
console.log('\n2. Test encryption:');
try {
  const encryptedPrivateKey = walletService.encryptPrivateKey(wallet.secretKey);
  console.log('Encryption successful:', !!encryptedPrivateKey.encrypted);
} catch (error) {
  console.log('❌ Encryption failed:', error.message);
}

// Step 3: Test recovery phrase generation
console.log('\n3. Test recovery phrase:');
try {
  const recoveryPhrase = walletService.generateRecoveryPhrase();
  console.log('Recovery phrase length:', recoveryPhrase.length);
} catch (error) {
  console.log('❌ Recovery phrase failed:', error.message);
}

console.log('\n4. The wallet that should be saved:');
console.log('Address:', wallet.publicKey);
console.log('Will validate as PublicKey:', wallet.publicKey);
