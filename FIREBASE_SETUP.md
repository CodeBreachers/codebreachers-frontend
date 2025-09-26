# Firebase Setup Guide

## Configuration Steps

1. **Get your Firebase configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web (</>) 
   - Copy the configuration object

2. **Update the configuration file:**
   - Open `/config/firebase.ts`
   - Replace the placeholder values in `firebaseConfig` with your actual Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

3. **Enable Firestore:**
   - In Firebase Console, go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location for your database

4. **Test the integration:**
   - Run your app: `npm start`
   - Navigate to the Explore tab
   - Click "Test Firebase Connection" to verify the setup
   - Use "Add Sample Item" to test data operations

## Features Included

- ✅ Firebase/Firestore initialization
- ✅ Test connection functionality
- ✅ Add documents to Firestore
- ✅ Read documents from Firestore
- ✅ Real-time data display
- ✅ Error handling and user feedback
- ✅ Loading states

## Collections Used

- `explore_items`: Stores sample items for the explore page
- `test_collection`: Used for connection testing

## Next Steps

You can extend this integration by:
- Adding authentication
- Implementing update/delete operations
- Adding real-time listeners
- Creating more complex data structures
- Adding offline support
