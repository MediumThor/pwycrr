# Firebase Storage Setup Guide

If you can't find your storage bucket in Google Cloud Console, you need to initialize Firebase Storage first.

## Step 1: Initialize Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pwycrr-4acc4**
3. In the left sidebar, click on **Storage**
4. If you see a "Get Started" button, click it
5. Choose **Start in production mode** (we'll set up security rules next)
6. Select a location for your storage bucket (should match your Firestore location if you have one)
7. Click **Done**

This will create your storage bucket: `pwycrr-4acc4.firebasestorage.app`

## Step 2: Apply Storage Security Rules

1. Still in Firebase Console, go to **Storage** > **Rules**
2. Paste the following rules:

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

3. Click **Publish**

## Step 3: Configure CORS (After Storage is Initialized)

According to the [official Google Cloud Storage CORS documentation](https://docs.cloud.google.com/storage/docs/using-cors), CORS configuration is typically done via command line using `gsutil`. The UI doesn't always show CORS settings clearly.

### Option A: Using gsutil (Command Line) - RECOMMENDED

This is often easier than finding it in the UI. Install Google Cloud SDK first:

**For Windows (PowerShell):**

1. **Install Google Cloud SDK:**
   - Download the installer: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
   - Or use winget: `winget install Google.CloudSDK`
   - During installation, ensure "Start Google Cloud SDK Shell" is selected
   - **Restart PowerShell** after installation

2. **Open PowerShell** and authenticate:
   ```powershell
   gcloud auth login
   ```
   This will open a browser window for you to sign in with your Google account.

3. **Set your project:**
   ```powershell
   gcloud config set project pwycrr-4acc4
   ```

4. **Create a file named `cors.json`** in your current directory (or any directory):
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "x-goog-upload-protocol", "x-goog-upload-command"]
     }
   ]
   ```

5. **Apply CORS configuration:**
   ```powershell
   gsutil cors set cors.json gs://pwycrr-4acc4.firebasestorage.app
   ```

   You should see: `Setting CORS on gs://pwycrr-4acc4.firebasestorage.app/...`

6. **Verify CORS was set** (optional):
   ```powershell
   gsutil cors get gs://pwycrr-4acc4.firebasestorage.app
   ```
   This will display the current CORS configuration to confirm it was applied.

## Troubleshooting

**If you still can't see the bucket in Google Cloud Console:**
- Make sure you're in the correct project (pwycrr-4acc4)
- Try refreshing the page
- Wait a few minutes after initializing - it can take a moment to appear
- Check that you have the correct permissions in Google Cloud Console

**Important Notes:**
- **CORS cannot be configured through the Google Cloud Console UI** - you must use `gsutil` command line tool
- The bucket must be fully initialized first (wait a minute after creating it in Firebase Console)
- After running `gsutil cors set`, wait a few seconds for the changes to propagate
- You can verify CORS is set by running `gsutil cors get gs://pwycrr-4acc4.firebasestorage.app`

**If you get "command not found" errors:**
- Make sure Google Cloud SDK is installed and PowerShell was restarted
- Try using the full path: `C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gsutil.cmd`
- Or use the "Google Cloud SDK Shell" that was installed

