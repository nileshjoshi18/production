import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);

  async function signup(email, password, type, userData) {
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email,
        userType: type,
        ...userData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      // Set the user type in the context
      setUserType(type);
      setUserData({ ...userData, email, userType: type });

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email, password, expectedUserType) {
    try {
      // Sign in the user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data from Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Check if user type matches the expected type
        if (data.userType !== expectedUserType) {
          // Sign out the user if type doesn't match
          await signOut(auth);
          throw new Error(`This account is registered as a ${data.userType}. Please use the ${data.userType} login channel.`);
        }
        
        setUserType(data.userType);
        setUserData(data);
        
        // Update last login time
        await updateDoc(userRef, {
          lastLogin: new Date().toISOString()
        });
      } else {
        console.error('User document not found in Firestore');
        setUserType(null);
        setUserData(null);
        throw new Error('User data not found. Please contact support.');
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function logout() {
    setUserType(null);
    setUserData(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // Fetch user data from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserType(data.userType);
            setUserData(data);
          } else {
            console.error('User document not found in Firestore');
            setUserType(null);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserType(null);
          setUserData(null);
        }
      } else {
        // User is signed out
        setUserType(null);
        setUserData(null);
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userType,
    userData,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 