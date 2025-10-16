import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/config/firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { City } from '@/types';
import { findNearbyCities, getNearbyCityDescription } from '@/utils/geoUtils';
import usCitiesData from '@/data/us_cities.json';
import { getCommentsConfig } from '@/config/commentsConfig';

export interface Comment {
  id: string;
  cityName: string;
  username: string;
  text: string;
  timestamp: Date;
  isNearby?: boolean;
  nearbyCityInfo?: {
    distance: number;
    description: string;
  };
}

interface CommentsContextType {
  comments: Comment[];
  nearbyComments: Comment[];
  username: string | null;
  setUsername: (username: string) => Promise<void>;
  addComment: (cityName: string, text: string) => Promise<void>;
  loadCommentsForCity: (cityName: string, cityCoords?: { lat: number; lng: number }) => void;
  loading: boolean;
  error: string | null;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

const USERNAME_STORAGE_KEY = '@mycity_username';

const allCities = usCitiesData as City[];

export function CommentsProvider({ children }: { children: React.ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nearbyComments, setNearbyComments] = useState<Comment[]>([]);
  const [username, setUsernameState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCityName, setCurrentCityName] = useState<string | null>(null);
  const [currentCityCoords, setCurrentCityCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Load username from AsyncStorage on mount
  useEffect(() => {
    loadUsername();
  }, []);

  // Subscribe to city-specific comments and nearby city comments
  useEffect(() => {
    if (!currentCityName) return;

    setLoading(true);
    const commentsRef = collection(db, 'comments');
    // Get all comments and filter in memory (no index needed)
    const q = query(
      commentsRef,
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allFetchedComments: Comment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            cityName: data.cityName,
            username: data.username,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        // Filter comments for the current city
        const currentCityComments = allFetchedComments.filter(
          (comment) => comment.cityName === currentCityName
        );
        setComments(currentCityComments);

        // Find nearby cities and their comments
        if (currentCityCoords) {
          const config = getCommentsConfig();
          
          console.log('[Comments] 🔍 Finding nearby cities for:', currentCityName, 'at', currentCityCoords);
          
          if (config.showNearbyComments) {
            const nearbyCities = findNearbyCities(
              {
                city: currentCityName,
                state_id: '', // We'll find this from the city data
                state_name: '',
                lat: currentCityCoords.lat.toString(),
                lng: currentCityCoords.lng.toString(),
              },
              allCities,
              config.maxProximityMiles,
              config.maxNearbyCities
            );
            
            console.log('[Comments] 📍 Found nearby cities:', nearbyCities.map(c => `${c.city}, ${c.state_id} (${c.distance}mi)`));

            // Get comments from nearby cities
            const nearbyCityNames = nearbyCities.map(city => city.city);
            console.log('[Comments] 🔍 Looking for comments from cities:', nearbyCityNames);
            console.log('[Comments] 🔍 All available comments:', allFetchedComments.map(c => c.cityName));
            
            const nearbyCityComments = allFetchedComments
              .filter((comment) => nearbyCityNames.includes(comment.cityName))
              .map((comment) => {
                const nearbyCity = nearbyCities.find(city => city.city === comment.cityName);
                return {
                  ...comment,
                  isNearby: true,
                  nearbyCityInfo: nearbyCity ? {
                    distance: nearbyCity.distance,
                    description: getNearbyCityDescription(nearbyCity, nearbyCity.distance),
                  } : undefined,
                };
              })
              .slice(0, config.maxNearbyComments); // Limit nearby comments

            console.log('[Comments] 📍 Found nearby comments:', nearbyCityComments.length);
            setNearbyComments(nearbyCityComments);
          } else {
            setNearbyComments([]);
          }
        } else {
          setNearbyComments([]);
        }

        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentCityName, currentCityCoords]);

  const loadUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
      setUsernameState(storedUsername);
    } catch (err) {
      console.error('Error loading username:', err);
    }
  };

  const setUsername = async (newUsername: string) => {
    try {
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, newUsername);
      setUsernameState(newUsername);
    } catch (err) {
      console.error('Error saving username:', err);
      throw err;
    }
  };

  const addComment = async (cityName: string, text: string) => {
    if (!username) {
      throw new Error('Username not set');
    }

    try {
      setCurrentCityName(cityName);
      const commentsRef = collection(db, 'comments');
      await addDoc(commentsRef, {
        cityName,
        username,
        text,
        timestamp: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to post comment');
      throw err;
    }
  };

  // Function to load comments for a specific city
  const loadCommentsForCity = (cityName: string, cityCoords?: { lat: number; lng: number }) => {
    setCurrentCityName(cityName);
    setCurrentCityCoords(cityCoords || null);
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
        nearbyComments,
        username,
        setUsername,
        addComment,
        loadCommentsForCity,
        loading,
        error,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentsContext);
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
}

