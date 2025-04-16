import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase is properly configured
const isConfigValid = () => {
  return process.env.REACT_APP_USE_FIREBASE === 'true' &&
    process.env.REACT_APP_FIREBASE_API_KEY &&
    process.env.REACT_APP_FIREBASE_PROJECT_ID;
};

// Initialize Firebase only if properly configured
let app;
let db;
let auth;
let storage;

try {
  if (isConfigValid()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully");
  } else {
    console.warn("Firebase not configured. Using mock data.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Mock firebase.ts file that provides placeholder values
// This prevents errors when Firebase imports are encountered in the code

// Log that Firebase is not being used
console.log('NOTICE: Firebase is not configured. Using mock implementation.');

// Create mock empty objects for Firebase services
export const mockDb = null;
export const mockAuth = null;
export const mockStorage = null;

// Export helper function to check if Firebase is configured
export const isFirebaseConfigured = () => false;

// Export function to verify Firebase app initialization
export const verifyFirebaseSetup = () => {
  console.log('Firebase integration is disabled in this deployment');
  return false;
};

export { db, auth, storage };
export default app; 