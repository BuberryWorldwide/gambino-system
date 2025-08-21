const fs = require('fs');

console.log('🔧 MOVING ROUTE TO CORRECT LOCATION');
console.log('===================================');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Remove the route from inside startServer
serverCode = serverCode.replace(/\/\/ Store check-in endpoint[\s\S]*?}\);(\s*const startServer)/m, '$1');

// Add the route before startServer
const storeRoute = `
// Store check-in endpoint
app.post('/api/stores/checkin', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.body;
    const userId = req.user.userId;
    
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID required' });
    }
    
    await User.findByIdAndUpdate(userId, {
      currentStore: storeId,
      checkedInAt: new Date(),
      lastActivity: new Date()
    });
    
    console.log(\`✅ User checked into store \${storeId}\`);
    
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
serverCode = serverCode.replace('const startServer = async () => {', storeRoute + 'const startServer = async () => {');

fs.writeFileSync('server.js.backup-before-location-fix', fs.readFileSync('server.js', 'utf8'));
fs.writeFileSync('server.js', serverCode);

console.log('✅ Moved route to correct location');
console.log('🔄 Server should restart automatically');
