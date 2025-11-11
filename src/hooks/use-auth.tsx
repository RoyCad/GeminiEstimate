
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, image?: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
  };
  
  const updateUserProfile = async (name: string, image: File | null = null) => {
    if (!auth.currentUser) {
        throw new Error("No user is signed in to update the profile.");
    }
    setLoading(true);
    try {
        let photoURL = auth.currentUser.photoURL;
        
        if (image) {
            const imageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
            const snapshot = await uploadBytes(imageRef, image);
            photoURL = await getDownloadURL(snapshot.ref);
        }

        await firebaseUpdateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photoURL
        });
        
        // Create a new user object to force re-render
        const updatedUser = { ...auth.currentUser, displayName: name, photoURL: photoURL } as User;
        setUser(updatedUser);


    } catch (error) {
        console.error("Error updating profile: ", error);
        throw error;
    } finally {
        setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
