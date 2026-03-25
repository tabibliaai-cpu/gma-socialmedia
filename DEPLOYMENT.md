# 🚀 Deployment Guide - Social Media + AI CRM

## Quick Deploy Summary

### Frontend → Vercel
### Backend → Railway (or Render)

---

## 📋 Prerequisites

You'll need accounts on:
1. **Vercel** - https://vercel.com (free tier works)
2. **Railway** - https://railway.app (or Render.com)
3. **Supabase** - Already set up ✅

---

## 1️⃣ Deploy Backend to Railway

### Step 1: Go to Railway
1. Visit https://railway.app
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `gma-socialmedia` repository
6. Select **`backend`** as the root directory

### Step 2: Add Environment Variables
Click on your project → Variables → Add these:

```
NODE_ENV=production
SUPABASE_URL=https://qvgpzjkawocfrwakmfdw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3B6amthd29jZnJ3YWttZmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzEzOTQsImV4cCI6MjA4OTUwNzM5NH0.ZJSlPtIU0NwPwnNR4mNYK_3_AizOY8Iaas_IjFPSLJ4
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3B6amthd29jZnJ3YWttZmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzMTM5NCwiZXhwIjoyMDg5NTA3Mzk0fQ.OlcCYBFpf1CKHaWm2KbmkLjegM1keP4eHrTrefr4kJA
JWT_SECRET=super-secret-jwt-key-for-social-app-2026-production
FRONTEND_URL=https://your-app.vercel.app
```

### Step 3: Deploy
- Railway will auto-build and deploy
- You'll get a URL like: `https://social-app-backend-production.up.railway.app`

---

## 2️⃣ Deploy Frontend to Vercel

### Step 1: Import Project
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import `gma-socialmedia` from GitHub
4. Set **Root Directory** to `frontend`

### Step 2: Configure
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`

### Step 3: Add Environment Variables
Click **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app/api
NEXT_PUBLIC_SUPABASE_URL=https://qvgpzjkawocfrwakmfdw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3B6amthd29jZnJ3YWttZmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzEzOTQsImV4cCI6MjA4OTUwNzM5NH0.ZJSlPtIU0NwPwnNR4mNYK_3_AizOY8Iaas_IjFPSLJ4
```

### Step 4: Deploy
- Click **"Deploy"**
- Wait for build to complete
- You'll get a URL like: `https://gma-socialmedia.vercel.app`

---

## 3️⃣ Update Backend CORS

After frontend is deployed, go back to Railway and update:
```
FRONTEND_URL=https://your-actual-vercel-app.vercel.app
```

---

## 🎉 Done!

Your app is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app

---

## 📱 Test Credentials

| Field | Value |
|-------|-------|
| Email | `test@test.com` |
| Password | `test123456` |

---

## 🔧 Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Make sure backend is running

### Login fails
- Check backend logs in Railway
- Verify Supabase credentials
- Check CORS settings

### 500 errors
- Check Railway logs
- Verify all env vars are set
- Make sure database tables exist

---

## 📊 All Features

| Feature | Status |
|---------|--------|
| Authentication | ✅ |
| User Profiles | ✅ |
| Posts & Feed | ✅ |
| Comments & Likes | ✅ |
| Real-time Chat | ✅ |
| CRM (Leads, Deals, Orders) | ✅ |
| Articles | ✅ |
| Ads Platform | ✅ |
| AI Automations | ✅ |
| Affiliates | ✅ |
| Notifications | ✅ |
| Search | ✅ |
| Payments | ✅ |

---

## 🆘 Need Help?

- Check Railway logs: Click project → Deployments → View Logs
- Check Vercel logs: Click project → Deployments → View Function Logs
- GitHub Issues: https://github.com/tabibliaai-cpu/gma-socialmedia/issues
