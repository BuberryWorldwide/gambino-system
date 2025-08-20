#!/bin/bash
# setup-credential-migration.sh

echo "🔧 Setting up Gambino Credential Migration..."

# Create required directories
echo "📁 Creating directories..."
mkdir -p backend/src/services
mkdir -p secure-vault
mkdir -p logs
mkdir -p keys

# Set secure permissions
chmod 700 secure-vault
chmod 755 logs

echo "✅ Directories created"

# Check if we're in the right location
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root directory."
    exit 1
fi

echo "✅ Project structure verified"

# Check what's in keys directory
echo "🔍 Checking keys directory contents..."
if [ -d "keys" ]; then
    echo "Keys directory contents:"
    ls -la keys/
else
    echo "⚠️  Keys directory is empty or doesn't exist"
    echo "ℹ️  You may need to run token creation first"
fi

# Check for existing credential manager
if [ ! -f "backend/src/services/credentialManager.js" ]; then
    echo "⚠️  credentialManager.js not found"
    echo "📝 You need to create this file from the artifact provided"
    echo "   Path: backend/src/services/credentialManager.js"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating basic .env file..."
    cat > .env << EOF
# Gambino Project Environment Variables
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gambino_devnet

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-change-this
WALLET_ENCRYPTION_KEY=your-wallet-encryption-key-change-this

# Treasury Master Key (will be generated during migration)
# TREASURY_MASTER_KEY=

# Admin API Keys
ADMIN_API_KEY=your-admin-api-key-change-this
MACHINE_API_KEY=your-machine-api-key-change-this

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOF
    echo "✅ Basic .env file created"
else
    echo "✅ .env file exists"
fi

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"

# Check if required packages are installed
echo "🔍 Checking required packages..."
if [ -f "backend/package.json" ]; then
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    else
        echo "✅ Backend dependencies installed"
    fi
    cd ..
else
    echo "⚠️  backend/package.json not found"
fi

# Check for Solana dependencies
echo "🔍 Checking Solana dependencies..."
if ! node -e "require('@solana/web3.js')" 2>/dev/null; then
    echo "⚠️  @solana/web3.js not found, installing..."
    cd backend && npm install @solana/web3.js @solana/spl-token && cd ..
else
    echo "✅ Solana dependencies found"
fi

echo ""
echo "🎯 SETUP COMPLETE!"
echo ""
echo "📋 Next steps:"
echo "1. Create backend/src/services/credentialManager.js from the provided artifact"
echo "2. Update your .env file with real values"
echo "3. Run: cd backend/scripts && node migrate-credentials.js"
echo ""
echo "🔧 Manual file creation needed:"
echo "   backend/src/services/credentialManager.js"
echo ""
echo "💡 Quick commands:"
echo "   cd /opt/gambino"
echo "   ./setup-credential-migration.sh"
echo "   cd backend/scripts"
echo "   node migrate-credentials.js"
