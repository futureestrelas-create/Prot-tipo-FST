// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtUJT7LhQH7OQGuBj4Gy8paOiygMcCLaA",
  authDomain: "future-stars-manager.firebaseapp.com",
  projectId: "future-stars-manager",
  storageBucket: "future-stars-manager.firebasestorage.app",
  messagingSenderId: "1091974260776",
  appId: "1:1091974260776:web:1c38bd02af39956fe1ed1d",
  measurementId: "G-8VYJ3B0BL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
