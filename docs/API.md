# API Documentation

## Base URL
```
Production: https://your-backend.railway.app/api
Development: http://localhost:3001/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```
POST /auth/register
Body: { email, password, username, role? }
Response: { user, access_token, refresh_token }
```

### Login
```
POST /auth/login
Body: { email, password }
Response: { user, access_token, refresh_token }
```

### Get Profile
```
GET /auth/me
Auth: Required
Response: { user with profile and privacy settings }
```

---

## Users Endpoints

### Get User Profile
```
GET /users/:username
Response: { profile data }
```

### Update Profile
```
PUT /users/profile
Auth: Required
Body: { username?, bio?, avatar_url? }
```

### Follow User
```
POST /users/follow/:userId
Auth: Required
```

### Unfollow User
```
POST /users/unfollow/:userId
Auth: Required
```

---

## Posts Endpoints

### Create Post
```
POST /posts
Auth: Required
Body: { caption?, media_url?, media_type? }
```

### Get Feed
```
GET /posts/feed?page=1&limit=20
Auth: Required
```

### Get Explore
```
GET /posts/explore?page=1&limit=20
```

### Like Post
```
POST /posts/:id/like
Auth: Required
```

### Add Comment
```
POST /posts/:id/comments
Auth: Required
Body: { content }
```

---

## Chat Endpoints

### Get Conversations
```
GET /chat/conversations
Auth: Required
```

### Get Conversation
```
GET /chat/conversation/:userId?page=1
Auth: Required
```

### Block User
```
POST /chat/block/:userId
Auth: Required
```

### Nuclear Block
```
POST /chat/nuclear-block/:userId
Auth: Required
```

### Set Paid Chat Settings
```
POST /chat/paid-settings
Auth: Required
Body: { price, enabled }
```

---

## CRM Endpoints

### Get Dashboard
```
GET /crm/dashboard
Auth: Required (Business role)
```

### Create Lead
```
POST /crm/leads
Auth: Required (Business role)
Body: { userId?, source, notes? }
```

### Get Leads
```
GET /crm/leads?status=new
Auth: Required (Business role)
```

### Create Deal
```
POST /crm/deals
Auth: Required (Business role)
Body: { leadId?, title, value?, expectedCloseDate? }
```

---

## Ads Endpoints

### Create Ad
```
POST /ads
Auth: Required
Body: { type, title?, description?, mediaUrl?, targetUrl, budget, targeting? }
```

### Get My Ads
```
GET /ads
Auth: Required
```

### Toggle Ad
```
PUT /ads/:id/toggle
Auth: Required
Body: { active: boolean }
```

---

## Articles Endpoints

### Create Article
```
POST /articles
Auth: Required
Body: { title, content, coverImageUrl?, isPaid?, price? }
```

### Get All Articles
```
GET /articles?page=1&limit=20
```

### Get Article
```
GET /articles/:id
```

### Purchase Article
```
POST /articles/:id/purchase
Auth: Required
Body: { paymentId }
```

---

## Search Endpoints

### Search
```
GET /search?q=query&type=all
Query params: q (required), type (all|users|posts|articles)
```

### Fact Check Search
```
GET /search/fact-check?q=query
```

### Get Trending
```
GET /search/trending
```

---

## Notifications Endpoints

### Get Notifications
```
GET /notifications?page=1
Auth: Required
```

### Get Unread Count
```
GET /notifications/unread-count
Auth: Required
```

### Mark All Read
```
POST /notifications/read-all
Auth: Required
```

---

## Payments Endpoints

### Create Order
```
POST /payments/create-order
Auth: Required
Body: { amount, currency?, type, referenceId? }
```

### Verify Payment
```
POST /payments/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
```

---

## AI Endpoints

### Create Automation
```
POST /ai/automations
Auth: Required
Body: { type, triggerEvent, promptTemplate }
```

### Generate Lead Follow-up
```
POST /ai/followup/:leadId
Auth: Required
```

### Fact Check
```
POST /ai/fact-check
Body: { content }
```

---

## WebSocket Events

### Connection
```
URL: ws://backend-url
Auth: { token: "jwt_token" }
```

### Events

**Send Message**
```
emit: 'message:send'
data: { receiverId, encryptedMessage, mediaUrl?, messageType? }
```

**Receive Message**
```
on: 'message:receive'
data: { message object }
```

**Typing**
```
emit: 'typing:start' | 'typing:stop'
data: { receiverId }
```

**User Online/Offline**
```
on: 'user:online' | 'user:offline'
data: { userId }
```

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error
