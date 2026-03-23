# Social Media + AI CRM Application - Build Plan

## Project Overview
Full-stack social media platform with secure messaging, privacy controls, creator monetization, business CRM, ads, and AI automation.

## Tech Stack
- **Frontend**: Next.js + Tailwind CSS + Zustand
- **Backend**: Node.js (NestJS) + REST APIs
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Realtime**: Socket.io
- **Auth**: Supabase Auth + JWT
- **Payments**: Razorpay
- **AI**: OpenAI API
- **Hosting**: Vercel (frontend) + Railway (backend)

## User Roles
- `user` - Standard user
- `creator` - Content creator with monetization
- `business` - Business account with CRM
- `admin` - Platform administrator

## Modules

### 1. Auth System
- [ ] Signup/Login with JWT
- [ ] Role assignment
- [ ] Password hashing

### 2. Profile System
- [ ] Username, bio, avatar
- [ ] Badge system (blue/gold)

### 3. Privacy System
- [ ] Name visibility controls
- [ ] DM permissions
- [ ] Search visibility

### 4. Chat System
- [ ] Real-time messaging (Socket.io)
- [ ] E2EE encryption
- [ ] Media sharing
- [ ] Paid chat unlock
- [ ] Nuclear block (delete all)

### 5. Affiliate System
- [ ] Business assigns badges to users
- [ ] Max 10 free, ₹75 extra

### 6. Posts System
- [ ] Image/video posts
- [ ] Caption
- [ ] Feed algorithm

### 7. Article System
- [ ] Free/paid articles
- [ ] Rich text content

### 8. Ads System
- [ ] Feed ads (every 5 posts)
- [ ] Comment ads (after 2)
- [ ] Profile ads

### 9. Search System
- [ ] Internal search
- [ ] External (Google API)
- [ ] Fact check verification

### 10. Profile Sharing
- [ ] Token-based links
- [ ] 5 min expiry, one-time use

### 11. Payment System
- [ ] Razorpay integration
- [ ] Paid chat, subscriptions, affiliates

### 12. Business CRM
- [ ] Leads management
- [ ] Deals tracking
- [ ] Orders
- [ ] Commissions

### 13. AI System
- [ ] Auto replies
- [ ] Lead follow-ups
- [ ] Deal suggestions

### 14. Dashboard
- [ ] Personal stats
- [ ] Creator earnings
- [ ] Business CRM data

### 15. Notifications
- [ ] Messages, payments, leads, ads

### 16. Storage
- [ ] Supabase buckets for all media

## Status: Building...
