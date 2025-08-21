// Fix duplicate import issue
const fs = require('fs');

console.log('🔧 FIXING DUPLICATE IMPORT');
console.log('==========================');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Find all instances of GambinoTokenService import
const lines = serverCode.split('\n');
let fixedLines = [];
let hasImport = false;

for (let line of lines) {
  if (line.includes("const GambinoTokenService = require('./src/services/gambinoTokenService');") ||
      line.includes("const GambinoTokenService = require('../services/gambinoTokenService');")) {
    if (!hasImport) {
      // Keep the first import, fix the path
      fixedLines.push("const GambinoTokenService = require('./src/services/gambinoTokenService');");
      hasImport = true;
    }
    // Skip duplicate imports
  } else {
    fixedLines.push(line);
  }
}

// Write fixed code
const fixedCode = fixedLines.join('\n');
fs.writeFileSync('server.js.backup-duplicate-fix', serverCode);
fs.writeFileSync('server.js', fixedCode);

console.log('✅ Fixed duplicate imports');
console.log('🔄 Server should start now');
