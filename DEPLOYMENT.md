# Vercel Deployment Guide for Mings Chinese Cuisine

This guide will walk you through deploying your luxurious restaurant menu application to Vercel.

## Quick Setup Overview

Your project is ready for Vercel deployment with the following setup:

- ✅ `vercel.json` configuration file created (frontend-only first)
- ✅ `api/menu-items/index.js` and `api/cart/index.js` serverless functions
- ✅ Frontend optimized for static deployment
- ✅ Environment variables template (`.env.example`)

**Strategy: Deploy frontend first, then add API functions**

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. MongoDB database connection string
3. GitHub repository (recommended)

## Step-by-Step Deployment

### Step 1: Fixed Configuration

The Vercel configuration has been updated to fix the static file serving issue:

```bash
# The vercel.json now uses:
# - buildCommand: "vite build --outDir dist/public"
# - outputDirectory: "dist/public"
# - Proper rewrites for SPA routing
```

**No manual build needed** - Vercel will build automatically.

### Step 2: Push to GitHub

1. Create a new GitHub repository
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit - Mings Chinese Cuisine restaurant app"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Deploy from GitHub (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will detect the `vercel.json` configuration automatically
4. Click "Deploy"

#### Option B: Deploy using Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Step 4: Configure Environment Variables

**Critical Step:** Add your MongoDB connection in Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://airavatatechnologiesprojects:8tJ6v8oTyQE1AwLV@mingsdb.mmjpnwc.mongodb.net/?retryWrites=true&w=majority&appName=MINGSDB`
   - **Environment:** Production (and Preview if needed)

**Your MongoDB connection string is ready to use** - just copy it from above!

### Step 5: Final Deployment

After adding environment variables:

1. Go to Deployments tab in Vercel
2. Click "Redeploy" on your latest deployment
3. Your app will be live at `https://your-app-name.vercel.app`

## Architecture for Vercel

```
Vercel Deployment Structure:
├── Frontend (Static) → dist/public/
│   ├── React app built with Vite
│   ├── Tailwind CSS styling
│   └── Royal theme with animations
├── Backend (Serverless) → api/index.js
│   ├── Express.js API routes
│   ├── MongoDB integration
│   └── Menu & cart operations
└── Configuration
    ├── vercel.json (routing & build config)
    └── Environment variables (MongoDB URI)
```

## Important Notes

- **Database:** Ensure MongoDB allows connections from Vercel IPs
- **Build Time:** The build process includes React optimization and may take 2-3 minutes
- **API Routes:** All `/api/*` requests are handled by serverless functions
- **Static Assets:** Frontend served from CDN for fast global delivery

## Troubleshooting

**Build Failures:**

- Ensure all dependencies are in `package.json`
- Check that TypeScript compilation passes locally

**API Issues:**

- Verify `MONGODB_URI` is set correctly in Vercel
- Check MongoDB allows external connections
- Review function logs in Vercel dashboard

**Database Connection:**

- Test connection string locally first
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` for Vercel

## What You Get

After successful deployment:

- ⚡ Lightning-fast global CDN delivery
- 🔒 Secure serverless API functions
- 📱 Mobile-optimized royal-themed interface
- 🍽️ Full restaurant menu browsing
- 🛒 Shopping cart functionality
- 🎨 Premium animations and effects

Your Mings Chinese Cuisine application will be live and ready to serve customers worldwide!
