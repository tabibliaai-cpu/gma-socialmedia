# Bug Fix: User Profile Viewing Issue

## Problem
When clicking on another user's profile from the feed, the app showed "Account does not exist" even though the account was visible in the feed.

## Root Cause
In NestJS, route order matters. Parameterized routes (like `@Get(':username')`) match ANY value, including paths that should match more specific routes.

The original controller had `@Get(':username')` positioned BEFORE several specific routes:
- `@Get('check-follow/:userId')`
- `@Get('shared/:token')`
- `@Get(':username/followers')`
- `@Get(':username/following')`

This caused the parameterized route to intercept these requests, treating "check-follow" or "shared" as usernames, which would then fail with "User not found" when those usernames didn't exist in the database.

## Solution
Reordered the routes in `backend/src/users/users.controller.ts` so that:
1. All static routes come first (e.g., `profile`, `check-follow/:userId`, `shared/:token`)
2. Routes with partial parameters come next (e.g., `:username/followers`, `:username/following`)
3. The fully parameterized route `@Get(':username')` comes LAST

## Additional Fixes
Also fixed missing `NotificationsModule` imports in:
- `backend/src/users/users.module.ts`
- `backend/src/posts/posts.module.ts`
- `backend/src/chat/chat.module.ts`

These modules use `NotificationsService` but weren't importing the `NotificationsModule`.

## Files Changed
- `backend/src/users/users.controller.ts` - Reordered routes
- `backend/src/users/users.module.ts` - Added NotificationsModule import
- `backend/src/posts/posts.module.ts` - Added NotificationsModule import
- `backend/src/chat/chat.module.ts` - Added NotificationsModule import

## Testing
The backend now starts successfully and routes are correctly ordered. Profile viewing should work as expected.
