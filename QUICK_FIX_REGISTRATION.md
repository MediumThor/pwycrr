# Quick Fix: Registration Permission Error

## The Problem
Registration form shows: `Missing or insufficient permissions` when submitting.

## The Solution (2 Steps)

### Step 1: Firestore Rules (30 seconds)

1. Go to: https://console.firebase.google.com/project/pwycrr-4acc4/firestore/rules
2. **Copy this EXACT rule** and make sure it's in your rules:

```javascript
match /regattaRegistrations/{registrationId} {
  allow create: if true;  // ← MUST say "if true" not "if request.auth != null"
  allow read, write: if request.auth != null;
}
```

3. Click **Publish**
4. Wait 20 seconds

### Step 2: Storage Rules (30 seconds)

1. Go to: https://console.firebase.google.com/project/pwycrr-4acc4/storage/pwycrr-4acc4.firebasestorage.app/rules
2. **Copy this EXACT rule** and make sure it's in your rules:

```javascript
match /regatta-registrations/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if true;  // ← MUST say "if true" for public uploads
}
```

3. Click **Publish**
4. Wait 20 seconds

### Step 3: Test

1. **Hard refresh** browser: Ctrl+Shift+R
2. Try submitting a registration
3. Should work now!

## Still Not Working?

Check these common mistakes:

❌ **Wrong:** `allow create: if request.auth != null;`  
✅ **Correct:** `allow create: if true;`

❌ **Wrong:** Collection name `regatta-registrations` (with dashes)  
✅ **Correct:** Collection name `regattaRegistrations` (camelCase)

❌ **Wrong:** Rules not published (just edited, didn't click Publish)  
✅ **Correct:** Must click **Publish** button

❌ **Wrong:** Testing immediately after publishing  
✅ **Correct:** Wait 20-30 seconds for rules to propagate

## Workflow (Already Set Up Correctly)

1. ✅ User submits registration → Status: `'new'`
2. ✅ Admin sees it in **Admin Dashboard > Registrations** tab
3. ✅ Admin clicks **"Approve for Fleet"** → Status: `'approved'`
4. ✅ Approved registrations appear in **Fleet** page

The code is already correct - you just need the rules!

