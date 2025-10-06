import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: مقادیر جایگزین زیر را با پیکربندی واقعی پروژه Firebase خود جایگزین کنید.
// می‌توانید این اطلاعات را در کنسول پروژه Firebase خود پیدا کنید:
// به تنظیمات پروژه (آیکون چرخ‌دنده) > تب General > بخش Your apps > قطعه کد Firebase SDK > گزینه Config بروید.
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890ab",
  measurementId: "G-XXXXXXXXXX" // اختیاری
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);
