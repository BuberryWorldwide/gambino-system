const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

class SimpleTokenCreator {
  constructor() {
    this.keysDir = path.join(process.cwd(), 'keys');
    this.treasuryAccounts = {
      jackpotReserve: { label: '🔒 JACKPOT RESERVE', percentage: 40 },
      operationsReserve: { label: '⚙️ OPERATIONS RESERVE', percentage: 25 },
      teamReserve: { label: '👥 TEAM RESERVE', percentage: 15 },
      communityRewards: { label: '🎁 COMMUNITY REWARDS', percentage: 10 },
      marketing: { label: '📢 MARKETING', percentage: 5 },
      testing: { label: '🧪 TESTING', percentage: 5 }
    };
  }

  async createSimpleTokenAccounts() {
    console.log('🎰 Creating Gambino token accounts...\\n');

    if (!fs.existsSync(this.keysDir)) {
      fs.mkdirSync(this.keysDir, { recursive: true });
    }

    // Create main treasury
    const mainTreasury = Keypair.generate();
    this.saveWallet('treasury.json', {
      label: '🏛️ MAIN TREASURY',
      publicKey: mainTreasury.publicKey.toString(),
      secretKey: Array.from(mainTreasury.secretKey),
      purpose: 'mint_authority'
    });

    // Create payer
    const payer = Keypair.generate();
    this.saveWallet('payer.json', {
      label: '💰 PAYER',
      publicKey: payer.publicKey.toString(),
      secretKey: Array.from(payer.secretKey),
      purpose: 'transaction_fees'
    });

    // Create treasury accounts
    for (const [accountType, config] of Object.entries(this.treasuryAccounts)) {
      const keypair = Keypair.generate();
      const fileName = `${accountType}-wallet.json`;
      
      this.saveWallet(fileName, {
        label: config.label,
        publicKey: keypair.publicKey.toString(),
        secretKey: Array.from(keypair.secretKey),
        percentage: config.percentage,
        accountType: accountType
      });

      console.log(`✅ Created ${config.label} (${config.percentage}%)`);
    }

    console.log(`\\n🎉 Created ${Object.keys(this.treasuryAccounts).length + 2} wallet accounts!`);
    console.log('📁 Files saved in: ./keys/');
    console.log('\\n🚀 Next: Run credential migration to encrypt these keys');
  }

  saveWallet(fileName, walletData) {
    const filePath = path.join(this.keysDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
  }

  async run() {
    try {
      await this.createSimpleTokenAccounts();
    } catch (error) {
      console.error('💥 Failed:', error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const creator = new SimpleTokenCreator();
  creator.run();
}
