import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ==========================================================================================
// مقادیر زیر بر اساس اطلاعاتی که ارائه دادید به‌روزرسانی شد.
// لطفاً مقادیر appId و measurementId را نیز از کنسول Firebase خود پیدا کرده و جایگزین کنید.
// 1. وارد کنسول Firebase شوید.
// 2. به تنظیمات پروژه (Project settings) بروید.
// 3. در تب General، به بخش Your apps بروید و اپلیکیشن وب خود را انتخاب کنید.
// 4. در بخش Firebase SDK snippet، گزینه Config را انتخاب کرده و مقادیر کامل را کپی کنید.
// ==========================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCnWyZfuhw0gBEjON8ak9aoGpfXZttm1l0",
  authDomain: "diginoronbeauty.firebaseapp.com",
  projectId: "diginoronbeauty",
  storageBucket: "diginoronbeauty.appspot.com",
  messagingSenderId: "740297695835",
  appId: "1:740297695835:web:ADD_YOUR_APP_ID_HERE", // TODO: این مقدار را از کنسول Firebase کپی کنید
  measurementId: "G-XXXXXXXXXX" // TODO: این مقدار را از کنسول Firebase کپی کنید (اختیاری)
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);