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

export interface Comment {
  id: string;
  cityName: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface CommentsContextType {
  comments: Comment[];
  username: string | null;
  setUsername: (username: string) => Promise<void>;
  addComment: (cityName: string, text: string) => Promise<void>;
  loadCommentsForCity: (cityName: string) => void;
  loading: boolean;
  error: string | null;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

const USERNAME_STORAGE_KEY = '@mycity_username';

export function CommentsProvider({ children }: { children: React.ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [username, setUsernameState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCityName, setCurrentCityName] = useState<string | null>(null);

  // Load username from AsyncStorage on mount
  useEffect(() => {
    loadUsername();
  }, []);

  // Subscribe to city-specific comments
  useEffect(() => {
    if (!currentCityName) return;

    setLoading(true);
    const commentsRef = collection(db, 'comments');
    // Temporary fix: Get all comments and filter in memory (no index needed)
    const q = query(
      commentsRef,
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments: Comment[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              cityName: data.cityName,
              username: data.username,
              text: data.text,
              timestamp: data.timestamp?.toDate() || new Date(),
            };
          })
          .filter((comment) => comment.cityName === currentCityName);
        setComments(fetchedComments);
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
  }, [currentCityName]);

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
  const loadCommentsForCity = (cityName: string) => {
    setCurrentCityName(cityName);
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
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

