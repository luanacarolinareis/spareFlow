// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAbc6eInV1KP9XxsU_ZfaUY5jTu_5b6SF4",
    authDomain: "spareflow-befbe.firebaseapp.com",
    projectId: "spareflow-befbe",
    storageBucket: "spareflow-befbe.firebasestorage.app",
    messagingSenderId: "1046560416625",
    appId: "1:1046560416625:web:fa97d0027afb20e4a34cd0",
    measurementId: "G-ND9B7NNPX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
