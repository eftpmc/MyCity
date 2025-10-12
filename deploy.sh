#!/bin/bash

# Urba Web Deployment Script
echo "🌐 Deploying Urba to the web..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the MyCity directory"
    exit 1
fi

# Build the web version
echo "📦 Building web version..."
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

echo "✅ Web build completed successfully!"
echo ""
echo "🚀 Your app is ready to deploy!"
echo ""
echo "📁 Built files are in the 'dist' folder"
echo ""
echo "🌐 Deployment options:"
echo ""
echo "1. Netlify (Recommended - Free):"
echo "   npm install -g netlify-cli"
echo "   netlify deploy --prod --dir=dist"
echo ""
echo "2. Vercel (Free):"
echo "   npm install -g vercel"
echo "   cd dist && vercel --prod"
echo ""
echo "3. Firebase (Free):"
echo "   npm install -g firebase-tools"
echo "   firebase init hosting"
echo "   firebase deploy"
echo ""
echo "4. GitHub Pages (Free):"
echo "   Upload dist/ folder to GitHub Pages"
echo ""
echo "📱 Your app will be accessible via URL once deployed!"
echo ""
echo "🔗 Deep link examples:"
echo "   https://your-domain.com/"
echo "   https://your-domain.com/city/San Francisco/CA"
echo "   https://your-domain.com/city/New York/NY/reports"
echo ""
echo "✨ Happy deploying!"
