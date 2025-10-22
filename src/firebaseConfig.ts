// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPdj9e5cIiFne1AyytS_5j71hjO5CZZk0",
  authDomain: "llfapp.firebaseapp.com",
  projectId: "llfapp",
  storageBucket: "llfapp.firebasestorage.app",
  messagingSenderId: "116491824891",
  appId: "1:116491824891:web:b68b83b07846f4a7be0a5e",
  measurementId: "G-N6J5YG8HK7",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
