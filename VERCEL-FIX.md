# Fix Vercel 401 Authentication Error

## Problem

Vercel is showing "Authentication Required" because **Deployment Protection** is enabled on your project.

## Solution

### Option 1: Disable Deployment Protection (Recommended)

1. Go to https://vercel.com/dashboard
2. Click on your `vincheck` project
3. Go to **Settings** → **Deployment Protection**
4. **Disable** deployment protection or set it to **"Public"**
5. The function will now be publicly accessible

### Option 2: Use Cloudflare Workers Instead

If you prefer not to disable protection, use Cloudflare Workers which doesn't have this restriction:

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

Then update `PROXY_API_URL` in `app.js` to your Cloudflare Worker URL.

### Option 3: Use Netlify

Netlify also works well and doesn't have deployment protection by default:

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Then update `PROXY_API_URL` in `app.js` to `/.netlify/functions/vehicle` or your full Netlify URL.
