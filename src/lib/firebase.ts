// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, memoryLocalCache, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration is loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db: any;

if (typeof window !== 'undefined') {
    try {
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
            experimentalForceLongPolling: true,
        });
    } catch (error: any) {
        if (error.code === 'failed-precondition') {
            console.warn(
                'Firestore persistence failed. Multiple tabs open. Falling back to in-memory persistence.'
            );
            db = initializeFirestore(app, { localCache: memoryLocalCache() });
        } else if (error.code === 'unimplemented') {
             console.warn(
                'Firestore persistence failed. Browser not supported. Falling back to in-memory persistence.'
            );
            db = initializeFirestore(app, { localCache: memoryLocalCache() });
        } else {
             console.error("Error enabling Firebase persistence: ", error);
             db = getFirestore(app);
        }
    }
} else {
    // For server-side rendering
    db = getFirestore(app);
}


const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, app, storage };
