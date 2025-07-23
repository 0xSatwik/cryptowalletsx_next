#!/bin/bash

# Simple deployment script for Fogo API Proxy Cloudflare Worker

echo "🚀 Deploying Fogo API Proxy to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Deploy the worker
echo "📦 Deploying worker..."
wrangler deploy fogo-api-proxy.js --name fogo-api-proxy --compatibility-date 2025-07-23

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your worker is now available at: https://fogo-api-proxy.your-subdomain.workers.dev"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy your worker URL"
    echo "2. Update the NEXT_PUBLIC_FOGO_API_URL environment variable in your .env.local file"
    echo "3. Test the endpoints:"
    echo "   - GET /account?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd"
    echo "   - GET /account/stake/total?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd"
    echo "   - GET /account/domain?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd"
    echo "   - GET /account/tokens?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd"
    echo "   - GET /account/transaction?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd&page_size=1"
else
    echo "❌ Deployment failed. Please check the error messages above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Make sure you're logged in: wrangler login"
    echo "2. Check your Cloudflare account has Workers enabled"
    echo "3. Try deploying manually: wrangler deploy fogo-api-proxy.js --name fogo-api-proxy"
fi
