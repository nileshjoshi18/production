import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgdJU7NPr84ZkuRUWrFZlh7uqiyb1uU-E",
  authDomain: "surplus-app-7ea67.firebaseapp.com",
  projectId: "surplus-app-7ea67",
  storageBucket: "surplus-app-7ea67.firebasestorage.app",
  messagingSenderId: "714765212370",
  appId: "1:714765212370:web:b3364abd72ff38fdebab0b"
};

console.log('Firebase Config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);