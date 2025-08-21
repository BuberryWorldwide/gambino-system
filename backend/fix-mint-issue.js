// Fix the mint.toBuffer error in createUserTokenAccount
const fs = require('fs');

console.log('🔧 FIXING MINT ISSUE');
console.log('===================');

let serviceCode = fs.readFileSync('src/services/gambinoTokenService.js', 'utf8');

// Find the problematic line and fix it
const oldLine = "      const tokenAccount = await getOrCreateAssociatedTokenAccount(";
const problemArea = `      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payerKeypair.keypair,
        this.gambinoMint,
        userPublicKey
      );`;

const fixedArea = `      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payerKeypair.keypair,
        new PublicKey(process.env.GAMBINO_MINT_ADDRESS),
        userPublicKey
      );`;

// Also check if this.gambinoMint is properly initialized
if (serviceCode.includes(problemArea)) {
  const fixedCode = serviceCode.replace(problemArea, fixedArea);
  
  fs.writeFileSync('src/services/gambinoTokenService.js.backup-mint-fix', serviceCode);
  fs.writeFileSync('src/services/gambinoTokenService.js', fixedCode);
  
  console.log('✅ Fixed mint issue - using PublicKey directly from env');
  console.log('🔄 Server should restart automatically');
} else {
  console.log('❌ Could not find the problematic code section');
  console.log('Let me check the constructor...');
  
  // Check how gambinoMint is initialized
  const constructorMatch = serviceCode.match(/this\.gambinoMint = .*;/);
  if (constructorMatch) {
    console.log('Current gambinoMint initialization:', constructorMatch[0]);
  }
}
