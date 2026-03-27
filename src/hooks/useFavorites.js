import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load favorites from Firestore with real-time listener
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    console.log('[useFavorites] Setting up listener for user:', user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const favs = data.favorites || [];
          console.log('[useFavorites] Favorites updated from Firestore:', favs);
          setFavorites(favs);
        } else {
          console.log('[useFavorites] User document does not exist yet');
          setFavorites([]);
        }
      },
      (err) => {
        console.error('[useFavorites] Listener error:', err);
        setFavorites([]);
      }
    );

    // Cleanup listener when component unmounts or user changes
    return () => {
      console.log('[useFavorites] Cleaning up listener');
      unsubscribe();
    };
  }, [user]);

  // Check if a service is favorited
  const isFavorited = (serviceId) => {
    return favorites.some(fav => fav.id === serviceId);
  };

  // Add a service to favorites
  const addFavorite = async (service) => {
    if (!user) {
      console.log('[useFavorites] No user, cannot add favorite');
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      
      // Create favorite data object with minimal fields
      const favoriteData = {
        id: service.id,
        name: service.name,
        category: service.category,
        location: service.location,
        rating: service.rating,
        reviews: service.reviews,
        trustScore: service.trustScore,
        price: service.price,
        image: service.image,
      };
      
      console.log('[useFavorites] Adding favorite for user:', user.uid);
      console.log('[useFavorites] Favorite data:', favoriteData);
      
      // Get current favorites array
      console.log('[useFavorites] Fetching current favorites...');
      const userDoc = await getDoc(userRef);
      const currentFavorites = userDoc.exists() ? (userDoc.data().favorites || []) : [];
      console.log('[useFavorites] Current favorites:', currentFavorites);
      
      // Check if already favorited
      if (currentFavorites.some(fav => fav.id === service.id)) {
        console.log('[useFavorites] Service already in favorites');
        return;
      }
      
      // Add new favorite
      const updatedFavorites = [...currentFavorites, favoriteData];
      console.log('[useFavorites] Updated favorites array:', updatedFavorites);
      
      // Update local state first for UI responsiveness
      setFavorites(updatedFavorites);
      
      // Write entire array to Firestore
      console.log('[useFavorites] Writing to Firestore...');
      await setDoc(userRef, { favorites: updatedFavorites }, { merge: true });
      console.log('[useFavorites] Favorite saved successfully to Firestore');
      
    } catch (err) {
      console.error('[useFavorites] Error adding favorite:', err);
      console.error('[useFavorites] Error code:', err.code);
      console.error('[useFavorites] Error message:', err.message);
      // Revert local state on error - let listener handle it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove a service from favorites
  const removeFavorite = async (serviceId) => {
    if (!user) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      
      console.log('[useFavorites] Removing favorite:', serviceId);
      
      // Get current favorites
      const userDoc = await getDoc(userRef);
      const currentFavorites = userDoc.exists() ? (userDoc.data().favorites || []) : [];
      
      // Filter out the service
      const updatedFavorites = currentFavorites.filter(fav => fav.id !== serviceId);
      
      // Remove from local state first for UI responsiveness
      setFavorites(updatedFavorites);
      
      // Write updated array to Firestore
      await setDoc(userRef, { favorites: updatedFavorites }, { merge: true });
      console.log('[useFavorites] Favorite removed successfully');
      
    } catch (err) {
      console.error('[useFavorites] Error removing favorite:', err);
      // Revert local state on error - let listener handle it
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (service) => {
    const alreadyFavorited = isFavorited(service.id);
    
    if (alreadyFavorited) {
      await removeFavorite(service.id);
    } else {
      await addFavorite(service);
    }
  };

  return {
    favorites,
    loading,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
