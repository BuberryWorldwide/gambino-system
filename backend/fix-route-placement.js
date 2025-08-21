// Move store endpoints to the correct location
const fs = require('fs');

console.log('🔧 FIXING ROUTE PLACEMENT');
console.log('=========================');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Remove the store endpoints from inside startServer function
serverCode = serverCode.replace(/\/\/ ===== STORE CHECK-IN SYSTEM =====[\s\S]*?}\);(\s*\/\/ Start server)/m, '$1');

// Find where to insert before startServer
const insertBeforePattern = /\/\/ Start server\s*const startServer/;
const match = serverCode.match(insertBeforePattern);

if (match) {
  const storeEndpoints = `
// ===== STORE CHECK-IN SYSTEM =====

// User checks into a store
app.post('/api/stores/checkin', authenticateUser, async (req, res) => {
  try {
    const { storeId } = req.body;
    const userId = req.user._id;
    
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID required' });
    }
    
    // Update user's current location and check-in time
    await User.findByIdAndUpdate(userId, {
      currentStore: storeId,
      checkedInAt: new Date(),
      lastActivity: new Date()
    });
    
    console.log(\`✅ User \${req.user.email || userId} checked into store \${storeId}\`);
    
    res.json({
      success: true,
      message: 'Checked into store successfully',
      storeId,
      checkedInAt: new Date()
    });
    
  } catch (error) {
    console.error('Store check-in error:', error);
    res.status(500).json({ error: 'Failed to check into store' });
  }
});

`;

  // Insert before startServer
  const fixedCode = serverCode.replace(insertBeforePattern, storeEndpoints + '// Start server\nconst startServer');
  
  fs.writeFileSync('server.js.backup-before-route-fix', serverCode);
  fs.writeFileSync('server.js', fixedCode);
  
  console.log('✅ Moved store endpoints to correct location');
  console.log('🔄 Server should restart automatically');
} else {
  console.log('❌ Could not find startServer pattern');
}
