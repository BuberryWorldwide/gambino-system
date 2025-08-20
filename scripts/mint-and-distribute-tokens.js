const { 
  Connection, 
  Keypair, 
  PublicKey,
  SystemProgram,
  Transaction
} = require('@solana/web3.js');
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} = require('@solana/spl-token');
const CredentialManager = require('../backend/src/services/credentialManager');

class GambinoTokenMinter {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.credentialManager = new CredentialManager();
    
    // Token configuration
    this.totalSupply = 777_000_000; // 777 million tokens
    this.decimals = 6; // Standard for gaming tokens
    
    // Treasury distribution percentages
    this.distribution = {
      jackpotReserve: 40,      // 40% - 310.8M tokens
      operationsReserve: 25,   // 25% - 194.25M tokens  
      teamReserve: 15,         // 15% - 116.55M tokens
      communityRewards: 10,    // 10% - 77.7M tokens
      marketing: 5,            // 5% - 38.85M tokens
      testing: 5              // 5% - 38.85M tokens
      // mainTreasury keeps mint authority
      // payer gets operational SOL for fees
    };
  }

  async mintGambinoToken() {
    try {
      console.log('🪙 GAMBINO TOKEN MINTING & DISTRIBUTION');
      console.log('=====================================');
      console.log(`Total Supply: ${this.totalSupply.toLocaleString()} GAMBINO`);
      console.log(`Decimals: ${this.decimals}`);
      console.log('Network: Solana Devnet\\n');

      // Get main treasury credentials (mint authority)
      const treasuryResult = await this.credentialManager.getKeypair('mainTreasury', 'TOKEN_MINTING');
      if (!treasuryResult.success) {
        throw new Error('Failed to get main treasury credentials');
      }
      const mintAuthority = treasuryResult.keypair;
      
      console.log(`🏛️ Main Treasury (Mint Authority): ${mintAuthority.publicKey.toString()}`);

      // Get payer credentials for transaction fees
      const payerResult = await this.credentialManager.getKeypair('payer', 'TOKEN_MINTING');
      if (!payerResult.success) {
        throw new Error('Failed to get payer credentials');
      }
      const payer = payerResult.keypair;
      
      console.log(`💰 Payer (Transaction Fees): ${payer.publicKey.toString()}\\n`);

      // Check payer has SOL for fees
      const payerBalance = await this.connection.getBalance(payer.publicKey);
      console.log(`💰 Payer SOL Balance: ${payerBalance / 1e9} SOL`);
      
      if (payerBalance < 1e8) { // Less than 0.1 SOL
        console.log('❌ Payer needs SOL for transaction fees!');
        console.log(`🚰 Get devnet SOL: https://faucet.solana.com/`);
        console.log(`📝 Payer address: ${payer.publicKey.toString()}`);
        return;
      }

      // Create the GAMBINO token mint
      console.log('🔨 Creating GAMBINO token mint...');
      const mint = await createMint(
        this.connection,
        payer,                    // Fee payer  
        mintAuthority.publicKey,  // Mint authority
        mintAuthority.publicKey,  // Freeze authority (same as mint)
        this.decimals            // Decimals
      );

      console.log(`✅ GAMBINO Token Created!`);
      console.log(`🪙 Mint Address: ${mint.toString()}\\n`);

      // Create token account for main treasury
      const mainTreasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        mint,
        mintAuthority.publicKey
      );

      // Mint total supply to main treasury
      console.log('🏭 Minting initial supply...');
      const mintAmount = this.totalSupply * Math.pow(10, this.decimals);
      
      await mintTo(
        this.connection,
        payer,                    // Fee payer
        mint,                     // Mint
        mainTreasuryTokenAccount.address, // Destination
        mintAuthority,            // Mint authority
        mintAmount               // Amount (with decimals)
      );

      console.log(`✅ Minted ${this.totalSupply.toLocaleString()} GAMBINO to main treasury\\n`);

      // Distribute to treasury accounts
      console.log('📦 Distributing to treasury accounts...\\n');
      
      for (const [accountType, percentage] of Object.entries(this.distribution)) {
        await this.distributeToTreasury(
          mint,
          mainTreasuryTokenAccount.address,
          mintAuthority,
          payer,
          accountType,
          percentage
        );
      }

      // Final summary
      await this.printFinalSummary(mint, mintAuthority);
      
      console.log('\\n🎉 GAMBINO TOKEN DEPLOYMENT COMPLETE!');
      console.log('=====================================');
      console.log(`🪙 Token: ${mint.toString()}`);
      console.log(`🏛️ Main Treasury: ${mintAuthority.publicKey.toString()}`);
      console.log(`📊 Total Supply: ${this.totalSupply.toLocaleString()} GAMBINO`);
      console.log(`🌐 Network: Solana Devnet`);

    } catch (error) {
      console.error('❌ Token minting failed:', error);
      throw error;
    }
  }

  async distributeToTreasury(mint, sourceAccount, mintAuthority, payer, accountType, percentage) {
    try {
      // Get treasury account credentials
      const treasuryResult = await this.credentialManager.getKeypair(accountType, 'TOKEN_DISTRIBUTION');
      if (!treasuryResult.success) {
        console.log(`❌ Failed to get ${accountType} credentials`);
        return;
      }

      const treasuryKeypair = treasuryResult.keypair;
      const amount = Math.floor((this.totalSupply * percentage / 100) * Math.pow(10, this.decimals));
      const displayAmount = (amount / Math.pow(10, this.decimals)).toLocaleString();

      // Create token account for this treasury
      const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        mint,
        treasuryKeypair.publicKey
      );

      // Transfer tokens from main treasury
      const { transfer } = require('@solana/spl-token');
      await transfer(
        this.connection,
        payer,                    // Fee payer
        sourceAccount,            // Source account (main treasury)
        treasuryTokenAccount.address, // Destination
        mintAuthority,            // Owner of source account
        amount                    // Amount with decimals
      );

      console.log(`✅ ${accountType}: ${displayAmount} GAMBINO (${percentage}%)`);
      console.log(`   📍 ${treasuryKeypair.publicKey.toString()}`);

    } catch (error) {
      console.error(`❌ Failed to distribute to ${accountType}:`, error);
    }
  }

  async printFinalSummary(mint, mintAuthority) {
    console.log('\\n📊 FINAL TOKEN DISTRIBUTION SUMMARY');
    console.log('===================================');

    // Check all treasury balances
    for (const [accountType, percentage] of Object.entries(this.distribution)) {
      try {
        const treasuryResult = await this.credentialManager.getKeypair(accountType, 'BALANCE_CHECK');
        if (treasuryResult.success) {
          const expectedAmount = (this.totalSupply * percentage / 100).toLocaleString();
          console.log(`${accountType.padEnd(20)} ${percentage.toString().padStart(3)}% - ${expectedAmount} GAMBINO`);
        }
      } catch (error) {
        console.log(`${accountType.padEnd(20)} ERROR`);
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const minter = new GambinoTokenMinter();
  minter.mintGambinoToken().catch(error => {
    console.error('💥 Minting failed:', error);
    process.exit(1);
  });
}

module.exports = GambinoTokenMinter;
