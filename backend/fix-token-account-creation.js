// Add token account creation before token distribution
const fs = require('fs');

console.log('🔧 ADDING TOKEN ACCOUNT CREATION');
console.log('=================================');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Find the token distribution section and add account creation before it
const oldDistribution = `    // Send real GAMBINO tokens from Community Rewards treasury
    console.log('💰 User created with real wallet:', user.walletAddress);
    console.log('🎁 Sending', tokens, 'GAMBINO tokens from treasury...');
    
    try {
      const rewardResult = await gambinoService.distributeRegistrationReward(
        user._id,
        user.walletAddress,
        'userRegistration'
      );`;

const newDistribution = `    // Send real GAMBINO tokens from Community Rewards treasury
    console.log('💰 User created with real wallet:', user.walletAddress);
    console.log('🏗️ Creating token account for user...');
    
    try {
      // First create token account for the user
      const tokenAccountResult = await gambinoService.createUserTokenAccount(user.walletAddress);
      if (!tokenAccountResult.success) {
        console.log('⚠️ Failed to create token account, skipping token distribution');
        throw new Error('Token account creation failed: ' + tokenAccountResult.error);
      }
      console.log('✅ Token account created:', tokenAccountResult.tokenAccount);
      
      console.log('🎁 Sending', tokens, 'GAMBINO tokens from treasury...');
      const rewardResult = await gambinoService.distributeRegistrationReward(
        user._id,
        user.walletAddress,
        'userRegistration'
      );`;

// Make the replacement
const fixedCode = serverCode.replace(oldDistribution, newDistribution);

// Backup and write
fs.writeFileSync('server.js.backup-before-token-account', serverCode);
fs.writeFileSync('server.js', fixedCode);

console.log('✅ Added token account creation before token distribution');
console.log('🔄 Restart server to test with token accounts');
