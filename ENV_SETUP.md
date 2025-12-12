# Environment Variables Setup

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon ⚙️ → Project Settings
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" → Web (</> icon)
   - Copy the config values from the Firebase SDK setup

3. **Update your `.env` file** with the actual values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Restart your dev server** after creating/updating `.env`:
   ```bash
   npm run dev
   ```

## Important Notes

- ⚠️ **Never commit `.env` to git** - it contains sensitive credentials
- ✅ `.env.example` is safe to commit (it's just a template)
- 🔄 You must restart the dev server after changing `.env` files
- 📝 All environment variables must start with `VITE_` to be accessible in Vite

## Finding Your Firebase Config

Your Firebase config object looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

Map each value to the corresponding `VITE_FIREBASE_*` variable in your `.env` file.

## Troubleshooting

If you see errors about missing Firebase config:
1. Check that `.env` exists in the root directory (same level as `package.json`)
2. Verify all variables start with `VITE_`
3. Make sure you restarted the dev server after creating `.env`
4. Check the browser console for specific missing variable names

