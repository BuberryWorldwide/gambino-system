const CredentialManager = require("./src/services/credentialManager");

(async () => {
  const manager = new CredentialManager();

  // Step 1: Fake keypair (just for testing)
  const fakeKeypair = {
    label: "Test Account",
    publicKey: "FAKE_PUBLIC_KEY_123",
    secretKey: Array.from({ length: 64 }, (_, i) => i), // dummy Uint8Array
  };

  // Step 2: Store credentials
  console.log("➡️ Storing test credentials...");
  const storeResult = await manager.storeCredentials("testing", fakeKeypair);
  console.log("Store Result:", storeResult);

  // Step 3: Retrieve credentials
  console.log("➡️ Retrieving test credentials...");
  const retrieveResult = await manager.retrieveCredentials("testing", "TESTING");
  console.log("Retrieve Result:", retrieveResult);

  // Step 4: List credentials
  console.log("➡️ Listing vault credentials...");
  const listResult = await manager.listCredentials();
  console.log("List Result:", listResult);

  // Step 5: Integrity check
  console.log("➡️ Checking vault integrity...");
  const integrity = await manager.verifyVaultIntegrity();
  console.log("Integrity Check:", integrity);
})();
