// Firebase Configuration
// Replace these values with your Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for Urba project
const firebaseConfig = {
  apiKey: "AIzaSyBC56_drKlbrha7vJYS1ULQyQFhZ9KimIc",
  authDomain: "urba-52530.firebaseapp.com",
  projectId: "urba-52530",
  storageBucket: "urba-52530.firebasestorage.app",
  messagingSenderId: "269882082103",
  appId: "1:269882082103:web:8f4c1a568c37184cd7d0b2",
  measurementId: "G-D1RPD5M607"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);


