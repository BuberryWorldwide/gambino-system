// Add missing import for getOrCreateAssociatedTokenAccount
const fs = require('fs');

console.log('🔧 FIXING MISSING IMPORT');
console.log('========================');

let serviceCode = fs.readFileSync('src/services/gambinoTokenService.js', 'utf8');

// Check current imports
console.log('Current imports section:');
const lines = serviceCode.split('\n');
for (let i = 0; i < 10; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

// Add getOrCreateAssociatedTokenAccount to the existing spl-token import
const oldImport = "const { getAssociatedTokenAddress, getAccount, transfer } = require('@solana/spl-token');";
const newImport = "const { getAssociatedTokenAddress, getAccount, transfer, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');";

if (serviceCode.includes(oldImport)) {
  const fixedCode = serviceCode.replace(oldImport, newImport);
  
  fs.writeFileSync('src/services/gambinoTokenService.js.backup-missing-import', serviceCode);
  fs.writeFileSync('src/services/gambinoTokenService.js', fixedCode);
  
  console.log('✅ Added getOrCreateAssociatedTokenAccount import');
  console.log('🔄 Server should restart automatically');
} else {
  console.log('❌ Could not find existing spl-token import to modify');
  console.log('Current import line:', serviceCode.match(/const.*@solana\/spl-token.*/));
}
