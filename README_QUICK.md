# QUICK START - READ THIS FIRST

## Project Status (Updated: 17:08 UTC)
- **Git**: ✅ Pushed to https://github.com/tabibliaai-cpu/gma-socialmedia
- **Frontend**: ❌ Not running (needs start)
- **Backend**: ❌ Not running (needs start)

## Immediate Actions Required

### 1. Start Frontend
```bash
cd /home/codespace/.openclaw/workspace/social-app/frontend
npm run dev
# Runs on port 3000
```

### 2. Start Backend
```bash
cd /home/codespace/.openclaw/workspace/social-app/backend
# Create .env if missing
cp .env.example .env
npm run start:dev
# Runs on port 3001
```

### 3. Create Test User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123456","username":"testuser"}'
```

## Access URLs (Codespace)
- Frontend: https://obscured-giggle-4g76g6pvg2hrxg-3000.app.github.dev
- Backend: https://obscured-giggle-4g76g6pvg2hrxg-3001.app.github.dev

## Test Credentials
- Email: test@test.com
- Password: test123456

## Full Documentation
- PROGRESS.md - Complete project details
- WORK_LOG.md - Session notes
- memory/2026-03-23.md - Memory file
