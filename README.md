# Social Media + AI CRM Application

A full-stack social media platform with secure messaging, privacy controls, creator monetization, business CRM, ads, and AI automation.

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS + Zustand
- **Backend**: NestJS + REST APIs
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Socket.io
- **Auth**: JWT + Supabase Auth
- **Payments**: Razorpay
- **AI**: OpenAI API

## Project Structure

```
social-app/
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/       # Pages
│   │   ├── components/# React components
│   │   ├── contexts/  # Auth & Socket contexts
│   │   ├── lib/       # API client & utils
│   │   └── store/     # Zustand state
│   └── ...
├── backend/           # NestJS backend
│   ├── src/
│   │   ├── auth/      # Authentication
│   │   ├── users/     # User management
│   │   ├── posts/     # Posts & feed
│   │   ├── chat/      # Real-time messaging
│   │   ├── crm/       # CRM module
│   │   ├── ads/       # Ads system
│   │   ├── ai/        # AI automation
│   │   ├── payments/  # Razorpay integration
│   │   └── ...
│   └── ...
└── database/
    └── schema.sql     # Database schema
```

## Features

### Core Features
- User authentication (JWT)
- Profiles with badges (blue/gold)
- Posts with images/videos
- Feed with algorithmic sorting
- Comments & likes
- Follow system

### Messaging
- Real-time chat (Socket.io)
- E2E encryption
- Media sharing
- Paid chat unlock
- Nuclear block (delete all messages)

### Business Features
- Business accounts
- CRM (Leads, Deals, Orders)
- Commissions tracking
- Affiliate badges
- Ads platform (feed, comment, profile ads)

### Creator Features
- Paid articles
- Subscriptions
- Earnings dashboard

### AI Features
- Auto-replies
- Lead follow-up suggestions
- Deal recommendations
- Content fact-checking

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Razorpay account
- OpenAI API key

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

### Database Setup

1. Create a Supabase project
2. Run the SQL schema in `database/schema.sql`
3. Enable Row Level Security (RLS)

## Environment Variables

### Backend (.env)
```
PORT=3001
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_RAZORPAY_KEY=your-razorpay-key
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/follow/:id` - Follow user

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed
- `POST /api/posts/:id/like` - Like post

### Chat
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/block/:id` - Block user

### CRM
- `GET /api/crm/dashboard` - Get dashboard
- `POST /api/crm/leads` - Create lead
- `GET /api/crm/deals` - Get deals

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
cd backend
railway init
railway up
```

## License

MIT
