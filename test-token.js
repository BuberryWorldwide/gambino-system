require('dotenv').config({ path: '/opt/gambino/.env' });
const { Connection, PublicKey } = require('@solana/web3.js');

async function checkToken() {
  console.log('ENV check:');
  console.log('SOLANA_RPC_URL:', process.env.SOLANA_RPC_URL);
  console.log('GAMBINO_MINT_ADDRESS:', process.env.GAMBINO_MINT_ADDRESS);
  
  if (!process.env.SOLANA_RPC_URL) {
    console.log('❌ SOLANA_RPC_URL not loaded from .env');
    return;
  }
  
  const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  const mintAddress = new PublicKey(process.env.GAMBINO_MINT_ADDRESS);
  
  try {
    console.log('🔍 Checking GAMBINO token on Solana devnet...');
    console.log('Mint Address:', mintAddress.toString());
    
    const mintInfo = await connection.getAccountInfo(mintAddress);
    console.log('✅ Token exists on blockchain:', !!mintInfo);
    console.log('SOL in mint account:', (mintInfo?.lamports || 0) / 1e9);
    
  } catch (error) {
    console.error('❌ Error checking token:', error.message);
  }
}

checkToken();
