# Fogo API Proxy - Cloudflare Worker

This Cloudflare Worker acts as a proxy for the Fogo API to handle CORS issues when making requests from the frontend.

## Deployment Instructions

### Option 1: Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Workers Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Navigate to "Workers & Pages" in the sidebar

2. **Create a New Worker**
   - Click "Create application"
   - Choose "Create Worker"
   - Give it a name like `fogo-api-proxy`

3. **Deploy the Code**
   - Copy the entire content from `fogo-api-proxy.js`
   - Paste it into the Cloudflare Worker editor
   - Click "Save and Deploy"

4. **Get Your Worker URL**
   - After deployment, you'll get a URL like: `https://fogo-api-proxy.your-subdomain.workers.dev`
   - Copy this URL for use in your frontend

### Option 2: Using Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Create wrangler.toml**
   ```toml
   name = "fogo-api-proxy"
   main = "fogo-api-proxy.js"
   compatibility_date = "2023-12-01"
   
   [env.production]
   name = "fogo-api-proxy"
   ```

4. **Deploy**
   ```bash
   wrangler deploy
   ```

## API Endpoints

Once deployed, your worker will provide these endpoints:

### Account Information
```
GET https://your-worker-url.workers.dev/account?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd
```

### Stake Information
```
GET https://your-worker-url.workers.dev/account/stake/total?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd
```

### Domain Information
```
GET https://your-worker-url.workers.dev/account/domain?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd
```

### Token Information
```
GET https://your-worker-url.workers.dev/account/tokens?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd
```

### Transaction Information
```
GET https://your-worker-url.workers.dev/account/transaction?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd&page_size=1
```

## Features

- ✅ **CORS Handling**: Adds proper CORS headers for cross-origin requests
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Caching**: 30-second cache for better performance
- ✅ **Validation**: Parameter validation for required fields
- ✅ **Security**: Only allows GET requests and validates endpoints

## Usage in Frontend

After deploying, update your frontend code to use the worker URL instead of the direct Fogo API:

```javascript
// Replace this:
const response = await fetch(`https://api.fogoscan.com/v1/account?address=${address}`);

// With this:
const response = await fetch(`https://your-worker-url.workers.dev/account?address=${address}`);
```

## Testing

You can test your deployed worker using curl:

```bash
curl "https://your-worker-url.workers.dev/account?address=AVfZ4PP1j171wMqZ2FsmCAG5844LhNc2hVHPuVbDCsmd"
```

## Cost

Cloudflare Workers has a generous free tier:
- 100,000 requests per day
- 10ms CPU time per request
- Perfect for this use case

## Security Notes

- The worker only allows GET requests
- All endpoints require an address parameter
- CORS is configured to allow all origins (`*`) - you can restrict this if needed
- No sensitive data is logged or stored
