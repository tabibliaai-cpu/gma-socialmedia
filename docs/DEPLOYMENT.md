# Deployment Guide

## Prerequisites

1. **Supabase Account** - For database and authentication
2. **Razorpay Account** - For payments
3. **OpenAI API Key** - For AI features
4. **Vercel Account** - For frontend hosting
5. **Railway Account** - For backend hosting

## Step 1: Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the schema from `database/schema.sql`
3. Enable Row Level Security (RLS) - already included in schema
4. Get your credentials from Project Settings > API:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

### Storage Buckets

Create these storage buckets in Supabase:
- `profiles` - for profile pictures
- `posts` - for post media
- `chat-media` - for chat attachments
- `ads` - for ad creatives
- `articles` - for article covers

## Step 2: Setup Razorpay

1. Create account at https://razorpay.com
2. Go to Settings > API Keys
3. Generate keys and copy:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

## Step 3: Setup OpenAI

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy: `OPENAI_API_KEY`

## Step 4: Deploy Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Initialize project
railway init

# Add environment variables
railway variables set SUPABASE_URL=your-url
railway variables set SUPABASE_SERVICE_KEY=your-key
# ... add all other env vars

# Deploy
railway up

# Get your backend URL
railway domain
```

## Step 5: Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Add environment variables in Vercel dashboard
# - NEXT_PUBLIC_API_URL (your Railway backend URL + /api)
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_RAZORPAY_KEY

# Production deploy
vercel --prod
```

## Step 6: Update CORS

In your backend `.env` on Railway, update:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Environment Variables Summary

### Backend (.env)
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
JWT_SECRET=xxx
OPENAI_API_KEY=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_RAZORPAY_KEY=xxx
```

## Monitoring

- Railway provides logs and metrics for backend
- Vercel provides analytics and logs for frontend
- Supabase provides database metrics

## Scaling

- Railway: Upgrade plan for more resources
- Vercel: Automatic scaling on Pro plan
- Supabase: Upgrade for more database capacity

## Security Checklist

- [ ] Enable RLS on all tables
- [ ] Set proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up SSL (automatic on Vercel/Railway)
- [ ] Configure Razorpay webhooks
- [ ] Set up monitoring and alerts
