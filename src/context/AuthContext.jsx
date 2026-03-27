import { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';

// Initialize Firestore OUTSIDE component (singleton instance)
const db = getFirestore();

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor auth state and restore profile from Firestore if needed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // If user logged in, restore their profile from Firestore
      if (currentUser) {
        try {
          let storedLocal = localStorage.getItem(`user_${currentUser.uid}`);
          
          if (!storedLocal) {
            // No local data - try to fetch from Firestore with timeout
            
            // Create a promise that rejects after 3 seconds
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Firestore fetch timeout')), 3000)
            );
            
            try {
              const userDoc = await Promise.race([
                getDoc(doc(db, 'users', currentUser.uid)),
                timeoutPromise
              ]);
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                // Save to localStorage for fast access
                localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(userData));
                storedLocal = JSON.stringify(userData);
              }
            } catch (timeoutErr) {
              // Create a default profile if Firestore fails
              const defaultProfile = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email.split('@')[0],
                userType: 'customer', // Default to customer
                createdAt: new Date().toISOString(),
                photoURL: currentUser.photoURL,
                isFavoritelisted: false,
                reviews: [],
                favorites: [],
                trustScore: null
              };
              localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify(defaultProfile));
              storedLocal = JSON.stringify(defaultProfile);
            }
          }
        } catch (err) {
          console.error('[AuthContext] Error restoring user profile:', err.message);
        }
      }
      
      setLoading(false);
    });
    console.log('[AuthContext] Listener subscription complete');
    return unsubscribe;
  }, []);

  // Sign up
  const signup = async (email, password, displayName, userType = 'customer') => {
    try {
      setError(null);
      console.log('[AuthContext] Starting signup for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, {
        displayName: displayName,
        photoURL: `https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff&size=150`
      });

      // Store user data in both localStorage AND Firestore
      const userData = {
        uid: result.user.uid,
        email,
        displayName,
        userType,
        createdAt: new Date().toISOString(),
        isFavoritelisted: false,
        reviews: [],
        trustScore: userType === 'provider' ? 0 : null
      };
      
      // Save to localStorage
      localStorage.setItem(`user_${result.user.uid}`, JSON.stringify(userData));
      console.log('[AuthContext] Saved to localStorage');
      
      // Save to Firestore (persistent storage)
      console.log('[AuthContext] Saving to Firestore with UID:', result.user.uid);
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email,
        displayName,
        userType,
        createdAt: new Date().toISOString(),
        photoURL: result.user.photoURL,
        trustScore: userType === 'provider' ? 0 : null,
        verified: false,
        favorites: []
      });
      console.log('[AuthContext] Successfully created user document in Firestore');
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Try to restore user profile from localStorage first
      let storedData = localStorage.getItem(`user_${result.user.uid}`);
      
      if (!storedData) {
        // If not in localStorage, fetch from Firestore
        try {
          const userDocRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Found in Firestore - restore to localStorage
            storedData = JSON.stringify(userDoc.data());
            localStorage.setItem(`user_${result.user.uid}`, storedData);
          } else {
            // User not found in Firestore either - this is a Google sign-in or new user
            // Don't assign a role - let the app handle it
            console.log('User not found in Firestore. May be a new Google sign-in.');
          }
        } catch (err) {
          console.error('Error fetching from Firestore:', err);
        }
      }
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get user profile data from localStorage OR Firestore
  const getUserProfile = async () => {
    if (!user) return null;
    
    let storedData = localStorage.getItem(`user_${user.uid}`);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // If not in localStorage, try Firestore
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Save to localStorage for future use
        localStorage.setItem(`user_${user.uid}`, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
    
    return null;
  };

  // Get user profile sync (for immediate use in render)
  const getUserProfileSync = () => {
    if (!user) return null;
    const storedData = localStorage.getItem(`user_${user.uid}`);
    return storedData ? JSON.parse(storedData) : null;
  };

  // Update user profile (save to both localStorage and Firestore)
  const updateUserProfile = async (data) => {
    if (!user) return;
    
    const currentData = getUserProfileSync() || {};
    const updated = { ...currentData, ...data };
    
    // Update localStorage
    localStorage.setItem(`user_${user.uid}`, JSON.stringify(updated));
    
    // Update Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    } catch (err) {
      console.error('Error updating Firestore:', err);
    }
  };

  // Set user role after Google sign-in
  const setUserRole = async (userType) => {
    if (!user) return;
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      userType,
      createdAt: new Date().toISOString(),
      photoURL: user.photoURL,
      isFavoritelisted: false,
      reviews: [],
      favorites: [],
      trustScore: userType === 'provider' ? 0 : null
    };
    
    // Save to localStorage
    localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
    
    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), userData);
    } catch (err) {
      console.error('Error setting user role:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    getUserProfile,
    getUserProfileSync,
    updateUserProfile,
    setUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
