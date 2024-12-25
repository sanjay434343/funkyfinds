import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCNysGPKExtGohowyAfSfO_A6fHqwtmZGY",
  authDomain: "vijaychitansfund.firebaseapp.com",
  databaseURL: "https://vijaychitansfund-default-rtdb.firebaseio.com",
  projectId: "vijaychitansfund",
  storageBucket: "vijaychitansfund.firebasestorage.app",
  messagingSenderId: "252546428279",
  appId: "1:252546428279:web:f224c272a9fada5f724572"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export default app;