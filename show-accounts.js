const CredentialManager = require('./backend/src/services/credentialManager');

async function showAccounts() {
  process.env.TREASURY_MASTER_KEY = '6a3a94706af2724c891b7df433bf6cdd4510f5b4463c6c2ebe4e07ec318945b7';
  
  const cm = new CredentialManager();
  const creds = await cm.listCredentials();
  
  console.log('🏦 TREASURY ACCOUNTS:');
  for (const cred of creds.credentials) {
    const result = await cm.retrieveCredentials(cred.accountType);
    if (result.success) {
      console.log(`${cred.metadata.label}: ${result.credentials.publicKey}`);
    }
  }
}

showAccounts().catch(console.error);
