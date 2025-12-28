// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvu9i_4XHBsgsTGu7jniPCxBYqwtVoBck",
  authDomain: "wrestle-guess.firebaseapp.com",
  projectId: "wrestle-guess",
  storageBucket: "wrestle-guess.appspot.com",
  messagingSenderId: "212456939579",
  appId: "1:212456939579:web:7339a535e38beccb7bc1e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
