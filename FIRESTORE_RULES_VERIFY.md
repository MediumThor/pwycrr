# Firestore Rules Verification - Step by Step

The registration is failing because Firestore rules aren't allowing public creates. Follow these exact steps:

## ⚠️ CRITICAL: The Rules MUST Allow Public Create

The rule for `regattaRegistrations` MUST have `allow create: if true;` to allow anyone to submit registrations.

## Step-by-Step Instructions:

### 1. Open Firebase Console
- Go to: https://console.firebase.google.com/
- Select project: **pwycrr-4acc4**

### 2. Navigate to Firestore Rules
- Click **Firestore Database** in left sidebar
- Click **Rules** tab at the top
- You should see a code editor

### 3. Check Current Rules
Look for this section in your rules:
```javascript
match /regattaRegistrations/{registrationId} {
  allow create: if true;  // ← THIS LINE IS CRITICAL
  allow read, write: if request.auth != null;
}
```

**If this section doesn't exist OR if it says `allow create: if request.auth != null;` instead of `if true;`, that's the problem!**

### 4. Replace ALL Rules
Copy the ENTIRE rules block below and paste it, REPLACING everything in the editor:

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

    // ⚠️ THIS IS THE CRITICAL RULE FOR REGISTRATIONS ⚠️
    // Regatta registrations - public create, admin read/write
    match /regattaRegistrations/{registrationId} {
      allow create: if true;  // ← PUBLIC CAN CREATE (SUBMIT REGISTRATIONS)
      allow read, write: if request.auth != null;  // ← ONLY ADMINS CAN READ/WRITE
    }

    // Sponsors - public read, admin write
    match /sponsors/{sponsorId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Click "Publish"
- After pasting, click the **Publish** button
- Wait for the success message

### 6. Wait 20-30 Seconds
- Rules can take up to 30 seconds to propagate
- Don't test immediately after publishing

### 7. Hard Refresh Browser
- Close the registration modal if it's open
- Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- This clears cached rules

### 8. Test Again
- Try submitting a registration
- Check browser console for errors

## Common Issues:

### Issue 1: Rules Not Published
- Make sure you clicked **Publish** after pasting
- Look for a success notification

### Issue 2: Wrong Rule Syntax
- The rule MUST say `allow create: if true;` not `if request.auth != null;`
- Check for typos or missing semicolons

### Issue 3: Default Deny Rule
- Make sure there's NO default deny rule at the end
- The rules should end with just the closing braces

### Issue 4: Collection Name Mismatch
- The collection name in code is `regattaRegistrations` (camelCase)
- Make sure the rule matches exactly: `match /regattaRegistrations/{registrationId}`

## Verify Rules Are Applied:

After publishing, you can verify by:
1. Looking at the Rules tab - it should show your new rules
2. Check the timestamp at the top - it should show when rules were last published
3. Try submitting a registration - if it works, rules are correct

## Still Not Working?

If you've followed all steps and it still fails:
1. Take a screenshot of your Firestore Rules tab
2. Check browser console for the exact error message
3. Verify you're testing from the correct URL (localhost vs production)

