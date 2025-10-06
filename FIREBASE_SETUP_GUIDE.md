# Firebase Setup Guide for Comments Feature

## Overview
You've successfully integrated a Firebase-powered comment system into your Wellness screen! Users can now share health observations about specific cities with crowdsourced data.

---

## 🚀 Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "MyCity Comments")
4. **Disable Google Analytics** (optional, not needed for this feature)
5. Click **"Create project"** and wait for it to finish

---

## 🔧 Step 2: Register Your App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "MyCity App")
3. **Do NOT check** "Set up Firebase Hosting"
4. Click **"Register app"**

---

## 📋 Step 3: Copy Your Firebase Config

You'll see a code snippet with your Firebase configuration. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "mycity-xyz.firebaseapp.com",
  projectId: "mycity-xyz",
  storageBucket: "mycity-xyz.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Copy these values** and paste them into your app:

### File to Update: `/config/firebase.ts`

Replace the placeholder values with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",              // ← Replace this
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // ← Replace this
  projectId: "YOUR_PROJECT_ID",                 // ← Replace this
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // ← Replace this
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Replace this
  appId: "YOUR_APP_ID"                          // ← Replace this
};
```

---

## 🗄️ Step 4: Create Firestore Database

1. In the Firebase Console, go to **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - This allows read/write access for 30 days
4. Select a Cloud Firestore location (choose one closest to your users)
5. Click **"Enable"**

### ⚠️ Important: Set Up Security Rules (Do this within 30 days!)

For **production**, update your Firestore rules to prevent abuse:

1. Go to **"Firestore Database" → "Rules"**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all comments
    match /comments/{comment} {
      allow read: if true;
      
      // Only allow writes if the request includes all required fields
      allow create: if request.resource.data.keys().hasAll(['cityName', 'username', 'text', 'timestamp'])
                    && request.resource.data.username is string
                    && request.resource.data.text is string
                    && request.resource.data.text.size() >= 5
                    && request.resource.data.text.size() <= 500
                    && request.resource.data.cityName is string;
      
      // Prevent updates and deletes
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

---

## 🧪 Step 5: Test Your Setup

1. **Restart your Expo app** after updating the Firebase config:
   ```bash
   # Stop the current dev server (Ctrl+C)
   npm start
   ```

2. Navigate to any city's **Wellness tab**

3. You should see:
   - **"Community Health Reports"** section at the bottom
   - A button to **"Set Username"**
   - An input box to post comments

4. Try posting a comment:
   - Click **"Set Username"** and create a username
   - Type a comment (minimum 5 characters)
   - Click **"Post"**

5. Your comment should appear immediately!

---

## ✅ Features Included

### 💬 **Comment System**
- Users can post observations about city health/wellness
- Comments are city-specific (each city has its own thread)
- Real-time updates (see new comments instantly)

### 👤 **Username Management**
- Simple username-only authentication (no password required)
- Username stored locally on device
- Can be changed at any time

### 🌍 **Crowdsourcing**
- All comments are shared across all users
- Data syncs in real-time via Firestore
- Comments sorted by newest first

### 🎨 **Beautiful UI**
- Matches your existing dark theme
- Timestamp display ("5m ago", "2h ago", etc.)
- Character counter (500 char limit)
- Loading states and empty states

---

## 📊 Database Structure

Your Firestore database will have a collection called `comments` with documents structured like:

```javascript
{
  cityName: "San Francisco",           // City name
  username: "john_doe",                 // User's chosen username
  text: "Air quality feels great!",    // Comment text
  timestamp: Timestamp(...)             // When posted
}
```

---

## 🔍 Monitoring Comments

### View All Comments in Firebase Console:
1. Go to **"Firestore Database"**
2. Click on the **"comments"** collection
3. You'll see all comments from all users

### Delete Inappropriate Comments:
1. Find the comment document
2. Click the **three dots** (⋮) → **"Delete document"**

---

## 💰 Cost & Limits

Firebase offers a **generous free tier**:

### Firestore Free Tier (Spark Plan):
- **50,000 reads/day**
- **20,000 writes/day**
- **20,000 deletes/day**
- **1 GB storage**

For a small-to-medium app, this is **more than enough** and will likely cost **$0/month**.

---

## 🚨 Troubleshooting

### ❌ Error: "Permission denied"
- Make sure you set Firestore to **"test mode"** or configured proper security rules
- Check that your Firebase config is correct in `/config/firebase.ts`

### ❌ Error: "Firebase not initialized"
- Verify you updated the config with your actual Firebase credentials
- Restart your Expo dev server

### ❌ Comments not showing up
- Open Firebase Console → Firestore Database
- Check if the `comments` collection exists
- Try posting a comment and see if it appears in Firebase

### ❌ App crashes on Wellness tab
- Check the terminal for error messages
- Make sure you installed dependencies: `npm install`
- Clear cache: `expo start --clear`

---

## 📱 Next Steps

### Optional Enhancements:
1. **Add voting/likes** on comments
2. **Report inappropriate content** button
3. **Filter comments by date range**
4. **Display user avatars** (based on username)
5. **Add image uploads** (requires Firebase Storage)
6. **Implement proper authentication** (Firebase Auth)

---

## 🎉 You're Done!

Your comment system is now live! Users can crowdsource health observations for each city, creating valuable community-driven data.

**Need help?** Check the Firebase documentation at https://firebase.google.com/docs

---

## 📝 Files Created/Modified

- ✅ `/config/firebase.ts` - Firebase configuration
- ✅ `/contexts/CommentsContext.tsx` - State management
- ✅ `/components/CommentsSection.tsx` - Main comment UI
- ✅ `/components/UsernameModal.tsx` - Username setup modal
- ✅ `/app/_layout.tsx` - Added CommentsProvider
- ✅ `/app/(stack)/city/[city]/(tabs)/reports.tsx` - Integrated comments

---

**Happy crowdsourcing! 🌍💬**


