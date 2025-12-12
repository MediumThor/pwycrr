# Permission Fix Checklist for Registration Form

The registration form requires **BOTH** Firestore and Storage rules to be correctly configured. Follow this checklist:

## ✅ Step 1: Firestore Rules (CRITICAL)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pwycrr-4acc4**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. **Copy the ENTIRE rules from `FIRESTORE_RULES_COMPLETE.txt`** (or see below)
6. **Replace ALL existing rules** in the editor
7. Click **Publish**
8. **Wait 10-20 seconds** for rules to propagate

### Required Firestore Rule (must be present):

```javascript
// Regatta registrations - public create, admin read/write
match /regattaRegistrations/{registrationId} {
  allow create: if true;  // ← This allows public submissions
  allow read, write: if request.auth != null;
}
```

## ✅ Step 2: Storage Rules (CRITICAL)

1. Still in Firebase Console
2. Click **Storage** in the left sidebar
3. Click the **Rules** tab at the top
4. **Copy the ENTIRE rules from `FIREBASE_RULES_FIX.md` lines 106-149** (or see below)
5. **Replace ALL existing rules** in the editor
6. Click **Publish**
7. **Wait 10-20 seconds** for rules to propagate

### Required Storage Rule (must be present):

```javascript
// Regatta registration documents - public upload, admin read
match /regatta-registrations/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if true;  // ← This allows public file uploads
}
```

## ✅ Step 3: Verify Rules Are Applied

After publishing both sets of rules:

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache** if needed
3. Try submitting a registration again

## 🔍 How to Check Which Step Is Failing

The updated code now shows specific error messages:
- If you see "Failed to upload files" → Storage rules issue
- If you see "Failed to save registration" → Firestore rules issue

## ⚠️ Common Mistakes

1. **Only updating one set of rules** - You need BOTH Firestore AND Storage rules
2. **Not clicking Publish** - Rules must be published to take effect
3. **Not waiting for propagation** - Rules can take 10-20 seconds to apply
4. **Using old cached rules** - Hard refresh your browser
5. **Rules not matching exactly** - Copy the complete rules, don't modify them

## 📋 Complete Firestore Rules (Copy This Entire Block)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog posts - public read for published, admin write
    match /blogPosts/{postId} {
      allow read: if resource.data.published == true || request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Images - public read, admin write
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Slideshow images for Charters page - public read, admin write
    match /slideshowImages/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Headshots - public read (About page), admin write (ImageLibrary)
    match /headshots/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Charter inquiries - public create, admin read/write
    match /charterInquiries/{inquiryId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }
    
    match /contactMessages/{msgId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }

    // Lesson inquiries - public create, admin read/write
    match /lessonInquiries/{inquiryId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }

    // Home page slideshow images
    match /homeSlideshowImages/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Inventory page image - public read, admin write
    match /inventoryImage/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Homepage image - public read, admin write
    match /homepageImage/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Charter registrations - public read/write for guestData, admin full access
    match /charterRegistrations/{registrationId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null || 
                     (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['guestData', 'status', 'updatedAt']));
      allow delete: if request.auth != null;
    }

    // Regatta registrations - public create, admin read/write
    match /regattaRegistrations/{registrationId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }

    // Sponsors - public read, admin write
    match /sponsors/{sponsorId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📋 Complete Storage Rules (Copy This Entire Block)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Admin uploaded images - admin only
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /home-slideshow/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /homepage/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /inventory/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /equipment/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Regatta registration documents - public upload, admin read
    match /regatta-registrations/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if true;
    }
    
    // Sponsor logos - public read, admin write
    match /sponsors/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

