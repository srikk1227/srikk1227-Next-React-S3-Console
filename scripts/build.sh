#!/bin/bash

# Next-React-S3-Console Production Build Script
# Version: 1.0.0

set -e

echo "🚀 Starting Next-React-S3-Console production build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Check build output
if [ -d ".next" ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build size:"
    du -sh .next
else
    echo "❌ Build failed!"
    exit 1
fi

# Optional: Run tests if available
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    echo "🧪 Running tests..."
    npm test
fi

echo "🎉 Production build completed successfully!"
echo "📁 Build output: .next/"
echo "🚀 Ready for deployment!" 