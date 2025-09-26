import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Configuration extracted from GoogleService-Info.plist
const firebaseConfig = {
  apiKey: "AIzaSyDdOMVBQawGW6Hp7SgZk_EgjmAiBTFDCjc",
  authDomain: "codebreachers-beta.firebaseapp.com",
  projectId: "codebreachers-beta",
  storageBucket: "codebreachers-beta.firebasestorage.app",
  messagingSenderId: "949400379468",
  appId: "1:949400379468:ios:d06f925f8194353dac54e9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

export default app;
