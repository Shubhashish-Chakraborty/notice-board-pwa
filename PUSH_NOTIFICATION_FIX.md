# Push Notification Fix - Complete Guide

## Problems Fixed

### 1. **Missing Push Event Listener in Service Worker** ❌→✅
The service worker only handled caching but had **NO push notification handler**. This is why notifications weren't showing on your phone.

**Fixed:** Added complete push notification event handling in `sw.js`:
- `push` event listener - receives and displays notifications
- `notificationclick` event listener - handles notification clicks
- `notificationclose` event listener - logs when user dismisses notification

### 2. **Wrong Environment Variable Name** ❌→✅
You were using `process.env.PUBLIC_VAPID_KEY` but Next.js requires `NEXT_PUBLIC_VAPID_KEY` prefix.

**Fixed:** Updated `page.tsx` to use correct variable name and added validation.

---

## What Changed

### File: `apps/frontend/public/sw.js`
Added 60+ lines for complete push notification handling:
```javascript
// NEW: Push notification listener
self.addEventListener('push', (event) => {
  // Shows notification when backend sends push message
});

// NEW: Notification click handler
self.addEventListener('notificationclick', (event) => {
  // Opens app when user clicks notification
});

// NEW: Notification close handler
self.addEventListener('notificationclose', (event) => {
  // Logs when user dismisses notification
});
```

### File: `apps/frontend/app/page.tsx`
- Changed `process.env.PUBLIC_VAPID_KEY` → `process.env.NEXT_PUBLIC_VAPID_KEY`
- Added validation to check if VAPID key exists
- Added error logging if key is missing

---

## Environment Setup Checklist

Before deploying, ensure you have:

### Backend Environment Variables (`.env`)
```
DATABASE_URL=your-postgres-url
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

### Frontend Environment Variables (`.env.local`)
```
NEXT_PUBLIC_VAPID_KEY=your-public-key
```

⚠️ **Important:** The VAPID key in frontend MUST match the one in backend!

---

## Testing Procedure

### Step 1: Build and Deploy
```bash
# Build frontend
cd apps/frontend
npm run build

# Build backend
cd ../backend
npm run build
```

### Step 2: Deploy Both Services
- Frontend → Vercel/Netlify (should be `https://shubhpwa.vercel.app`)
- Backend → Vercel/Railway/Render (should be `https://shubhpwaapi.vercel.app`)

### Step 3: Test on Phone
1. **Open the app** on your phone via the HTTPS link
2. **Allow notifications** when prompted (crucial!)
3. **Go to admin page**: `https://shubhpwa.vercel.app/admin`
4. **Type a message** and click "Submit & Broadcast"
5. **Check phone** - notification should appear within 1 second

### Step 4: Verify
- ✅ Notification appears on home screen
- ✅ Notification shows your custom title "New Update!"
- ✅ Notification shows your custom message body
- ✅ Clicking notification opens the app
- ✅ Works even when app is closed

---

## Common Issues & Fixes

### Issue: Notification not showing
**Causes:**
1. ❌ User didn't allow notification permission → Ask user to allow in browser settings
2. ❌ `NEXT_PUBLIC_VAPID_KEY` not set → Add to `.env.local`
3. ❌ Service worker not registered → Check browser DevTools → Application → Service Workers
4. ❌ Not on HTTPS → PWA notifications only work on HTTPS
5. ❌ Backend API unreachable → Check CORS origin in backend includes frontend URL

**Fix:**
```bash
# Check service worker registration
# Open browser DevTools → Application → Service Workers
# Should show one active and running

# Check subscriptions saved
# In backend terminal, you should see successful subscription saves
```

### Issue: "NEXT_PUBLIC_VAPID_KEY is not set"
**Solution:**
1. Create `.env.local` in `apps/frontend/`
2. Add: `NEXT_PUBLIC_VAPID_KEY=your-key-here`
3. Rebuild and redeploy

### Issue: Backend returning 410 error
This means subscriptions are being deleted (user uninstalled/revoked permission)
- **Normal behavior** - users can revoke notification permission
- Send them to re-allow notifications

---

## How It Works Now

```
User Visits Site
    ↓
PWA asks for notification permission
    ↓
User clicks "Allow"
    ↓
Frontend registers Service Worker
    ↓
Frontend subscribes to push notifications
    ↓
Subscription sent to Backend API
    ↓
Backend saves subscription to Database
    ↓
------- Admin sends notification -------
    ↓
Backend fetches all subscriptions
    ↓
Backend sends push message to each subscription
    ↓
Service Worker receives 'push' event
    ↓
sw.js displays notification on phone ✅
    ↓
User sees notification on home screen
```

---

## Debugging

### Enable Logging
Already added comprehensive logging in `sw.js`:
```javascript
console.log('[Service Worker] Push notification received:', event);
console.log('[Service Worker] Showing notification:', notificationData);
console.log('[Service Worker] Notification clicked:', event.notification);
```

### Check Logs
1. **Browser Console**: Open DevTools, go to Console tab
2. **Service Worker Console**: DevTools → Application → Service Workers → Click your worker
3. **Backend Logs**: Check backend terminal/logs for push send status

---

## Deployment Checklist

- [ ] `NEXT_PUBLIC_VAPID_KEY` added to frontend `.env.local`
- [ ] `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in backend `.env`
- [ ] Both keys match (same pair)
- [ ] Frontend built and deployed
- [ ] Backend built and deployed
- [ ] CORS origins updated in backend if URLs changed
- [ ] Tested on real phone, not just browser
- [ ] Notifications showing and clicking works
- [ ] App opens when notification is clicked

---

## Next Steps

1. **Verify Environment Variables** are set correctly
2. **Rebuild** both frontend and backend
3. **Deploy** to production
4. **Test** on your phone by sending a message from admin page
5. **Confirm** notifications appear on phone

Your push notifications should now work! 🎉
