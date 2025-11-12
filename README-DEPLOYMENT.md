# Serverless Function Deployment Guide

This project includes serverless function implementations for three platforms to solve the CORS issue. Choose one platform to deploy.

## Option 1: Vercel (Recommended - Easiest)

Vercel can deploy both your static site and the serverless function together.

### Steps:

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel
   ```

   Follow the prompts to link your project.

3. **Update `app.js`**:

   - The `PROXY_API_URL` is already set to `/api/vehicle` which works with Vercel
   - If you want to use a custom domain, update it to: `https://your-domain.vercel.app/api/vehicle`

4. **That's it!** Your site and API function are now deployed together.

**Note:** You can also connect your GitHub repo to Vercel for automatic deployments.

---

## Option 2: Netlify

Netlify can also deploy both your static site and serverless functions together.

### Steps:

1. **Install Netlify CLI** (if not already installed):

   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:

   ```bash
   netlify deploy --prod
   ```

   Or connect your GitHub repo through the Netlify dashboard.

3. **Update `app.js`**:
   Change `PROXY_API_URL` to:
   ```javascript
   const PROXY_API_URL = "/.netlify/functions/vehicle";
   ```
   Or use your full Netlify URL:
   ```javascript
   const PROXY_API_URL =
     "https://your-site.netlify.app/.netlify/functions/vehicle";
   ```

---

## Option 3: Cloudflare Workers (Free, Fast)

Cloudflare Workers is a separate service - you'll deploy the worker separately from your GitHub Pages site.

### Steps:

1. **Install Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Deploy the worker**:

   ```bash
   npm run deploy:worker
   ```

   Or:

   ```bash
   wrangler deploy
   ```

4. **Get your worker URL** (e.g., `https://vincheck-proxy.your-subdomain.workers.dev`)

5. **Update `app.js`**:
   Change `PROXY_API_URL` to your worker URL:

   ```javascript
   const PROXY_API_URL = "https://vincheck-proxy.your-subdomain.workers.dev";
   ```

6. **Deploy your frontend** to GitHub Pages as usual.

---

## Recommended Setup

**For GitHub Pages + Serverless Function:**

1. **Deploy frontend** to GitHub Pages (as you're already doing)
2. **Deploy serverless function** to one of the platforms above
3. **Update `PROXY_API_URL`** in `app.js` to point to your deployed function
4. **Commit and push** the updated `app.js`

---

## Testing Locally

If you want to test with Vercel or Netlify locally:

**Vercel:**

```bash
vercel dev
```

**Netlify:**

```bash
netlify dev
```

Then your local server will serve both the static files and the API function.

---

## Which Platform Should I Choose?

- **Vercel**: Best if you want to deploy everything together, easiest setup
- **Netlify**: Similar to Vercel, also good for full-stack deployment
- **Cloudflare Workers**: Best if you want to keep GitHub Pages separate, very fast and free

All three platforms have free tiers that should be sufficient for this use case.
