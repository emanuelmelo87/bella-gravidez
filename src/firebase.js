import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5e551VJ5EVEn8IS9ssMLpu7jo56Hxv8o",
  authDomain: "bella-gravidez.firebaseapp.com",
  projectId: "bella-gravidez",
  storageBucket: "bella-gravidez.firebasestorage.app",
  messagingSenderId: "948546838752",
  appId: "1:948546838752:web:70614f9a8240b7bc9cf085",
  measurementId: "G-9GLMXBTTHG",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
