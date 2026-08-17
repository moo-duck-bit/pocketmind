// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";  // Firebase Authentication
import { getFirestore } from "firebase/firestore";  // Firebase Firestore

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// 값은 .env 에서 주입합니다 (.env.example 참고).
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);  // Firebase Authentication
const db = getFirestore(app);  // Firebase 
const provider = new GoogleAuthProvider();

// Initialize messaging only if serviceWorker is supported
let messaging = null;
if ('serviceWorker' in navigator) {
    import("firebase/messaging").then(({ getMessaging }) => {
        messaging = getMessaging(app);
        console.log("Firebase Messaging initialized", messaging);
    }).catch(error => {
        console.error("Error initializing Firebase Messaging", error);
    });
} else {
    console.log("Service Worker is not supported, skipping Firebase Messaging.");
}

export { app, auth, db, provider, messaging };