#!/bin/bash

echo "🔄 Loop Agent Setup Script"
echo "=========================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "📝 Creating .env.local with placeholder..."
    echo "ANTHROPIC_API_KEY=your_api_key_here" > .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your Anthropic API key!"
    echo "   Get your key from: https://console.anthropic.com/settings/keys"
    echo ""
else
    echo "✅ .env.local found"
fi

# Check if API key is set
if grep -q "your_api_key_here" .env.local; then
    echo "⚠️  API key not configured in .env.local"
    echo "   Please edit .env.local and add your real Anthropic API key"
    echo ""
else
    echo "✅ API key appears to be configured"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Setup complete! To start Loop Agent:"
echo "   npm run dev"
echo ""
echo "   Then visit: http://localhost:3000"
echo ""
echo "💡 Try these commands with Loop Agent:"
echo "   • 'List files in this directory'"
echo "   • 'Show me system information'"
echo "   • 'Create a hello world script'"
echo "   • 'Read the package.json file'"
