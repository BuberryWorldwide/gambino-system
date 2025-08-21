// Fix the syntax error in gambinoTokenService.js
const fs = require('fs');

console.log('🔧 FIXING SYNTAX ERROR');
console.log('======================');

// Check what's around line 232
let serviceCode = fs.readFileSync('src/services/gambinoTokenService.js', 'utf8');
const lines = serviceCode.split('\n');

console.log('Lines around 230-235:');
for (let i = 225; i < 240 && i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

// Let's restore from backup and try again
if (fs.existsSync('src/services/gambinoTokenService.js.backup-before-token-account')) {
  const backupCode = fs.readFileSync('src/services/gambinoTokenService.js.backup-before-token-account', 'utf8');
  
  // Find the last method in the class and add our method there
  const classEndPattern = /}\s*module\.exports\s*=\s*GambinoTokenService/;
  const match = backupCode.match(classEndPattern);
  
  if (match) {
    const tokenAccountMethod = `
  // Create token account for a user wallet
  async createUserTokenAccount(userWalletAddress) {
    try {
      console.log('🏗️ Creating token account for wallet:', userWalletAddress);
      
      const userPublicKey = new PublicKey(userWalletAddress);
      const payerKeypair = await this.credentialManager.getKeypair('payer');
      
      if (!payerKeypair.success) {
        throw new Error('Failed to get payer credentials');
      }
      
      // Get or create associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payerKeypair.keypair,
        this.gambinoMint,
        userPublicKey
      );
      
      console.log('✅ Token account created/found:', tokenAccount.address.toString());
      
      return {
        success: true,
        tokenAccount: tokenAccount.address.toString(),
        mint: this.gambinoMint.toString(),
        owner: userWalletAddress
      };
      
    } catch (error) {
      console.error('❌ Token account creation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
`;
    
    // Insert the method before the closing brace and module.exports
    const fixedCode = backupCode.replace(
      classEndPattern,
      tokenAccountMethod + '\n}\n\nmodule.exports = GambinoTokenService'
    );
    
    fs.writeFileSync('src/services/gambinoTokenService.js', fixedCode);
    console.log('✅ Fixed syntax error and added method properly');
  } else {
    console.log('❌ Could not find class end pattern');
  }
} else {
  console.log('❌ Backup file not found');
}
