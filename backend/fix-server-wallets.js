const fs = require('fs');
const { Keypair } = require('@solana/web3.js');

console.log('🔧 FIXING SERVER.JS WALLET GENERATION');
console.log('=====================================');

// Read server.js
let serverCode = fs.readFileSync('server.js', 'utf8');

// Replace the fake generateWalletAddress function with real Solana generation
const oldFunction = `const generateWalletAddress = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 44; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
};`;

const newFunction = `const generateWalletAddress = () => {
  const { Keypair } = require('@solana/web3.js');
  const keypair = Keypair.generate();
  return keypair.publicKey.toString();
};`;

// Make the replacement
const fixedCode = serverCode.replace(oldFunction, newFunction);

// Backup original
fs.writeFileSync('server.js.backup-broken-wallets', serverCode);

// Write fixed version
fs.writeFileSync('server.js', fixedCode);

console.log('✅ Fixed server.js wallet generation');
console.log('✅ Original backed up as server.js.backup-broken-wallets');
console.log('🔄 Restart your server to apply the fix');
