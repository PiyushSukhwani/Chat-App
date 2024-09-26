import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updateEmail, updatePassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8qJE59i14NEDmz_XDbU5zfTDnADI9xuM",
  authDomain: "chatapp-a2a85.firebaseapp.com",
  projectId: "chatapp-a2a85",
  storageBucket: "chatapp-a2a85.appspot.com",
  messagingSenderId: "1080932165160",
  appId: "1:1080932165160:web:52c4e82972448fa640b71d"
};

const app = initializeApp(firebaseConfig);

 const auth = getAuth()
export const db = getFirestore(app)
export const storage = getStorage(app)
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged }
