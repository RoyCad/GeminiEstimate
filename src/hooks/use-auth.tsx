
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
    onAuthStateChanged, 
    signOut, 
    User, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/firebase';

const adminEmails = ['royconstruction000@gmail.com'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionRole: 'Admin' | 'Client' | null;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  signInAsAdmin: (email: string, pass: string) => Promise<User | null>;
  updateUserProfile: (name: string, image: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionRole, setSessionRole] = useState<'Admin' | 'Client' | null>(null);

  const fetchUserRole = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setSessionRole(null);
      return null;
    }
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSessionRole(userData.role);
        return userData.role;
      } else {
        // This case can happen if a user is created in Auth but not in Firestore yet.
        setSessionRole(null); 
        return null;
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setSessionRole(null);
      return null;
    }
  }, [firestore]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await fetchUserRole(firebaseUser);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [auth, fetchUserRole]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  const signInAsAdmin = async (email: string, pass: string): Promise<User | null> => {
     if (!adminEmails.includes(email)) {
        throw new Error("This email is not registered as a valid admin email.");
     }
     
     try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        // onAuthStateChanged will handle the rest
        return userCredential.user;
     } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                const newUser = userCredential.user;
                const displayName = "Admin"; 
                await updateFirebaseProfile(newUser, { displayName });

                const userDocRef = doc(firestore, 'users', newUser.uid);
                await setDoc(userDocRef, {
                    id: newUser.uid,
                    displayName: displayName,
                    email: newUser.email,
                    photoURL: newUser.photoURL || '',
                    creationTime: serverTimestamp(),
                    role: 'Admin'
                });
                return newUser;
            } catch (creationError: any) {
                 console.error("Admin user creation failed:", creationError);
                 throw new Error(`Failed to create the admin account: ${creationError.message}`);
            }
        }
        console.error("Admin sign-in error:", error);
        throw error;
     }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email || '';

      const isUserAdmin = adminEmails.includes(userEmail);
      const targetRole = isUserAdmin ? 'Admin' : 'Client';
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!isUserAdmin) {
        const projectsRef = collection(firestore, 'projects');
        const q = query(projectsRef, where("clientEmail", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await logout();
            throw new Error("Access Denied: This Google account is not associated with any project. Please contact the administrator.");
        }
        
        const batch = writeBatch(firestore);
        querySnapshot.forEach(projectDoc => {
            if (projectDoc.data().userId !== user.uid) {
               const projectRef = doc(firestore, 'projects', projectDoc.id);
               batch.update(projectRef, { userId: user.uid });
            }
        });
        await batch.commit();
      }

      if (!userDoc.exists()) {
           await setDoc(userDocRef, {
              id: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              creationTime: serverTimestamp(),
              role: targetRole
          });
      } else if (userDoc.data().role !== targetRole) {
          await setDoc(userDocRef, { role: targetRole }, { merge: true });
      }

      // onAuthStateChanged will handle setting the user and role
      return user;
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (auth.currentUser) {
        await logout(); 
      }
      throw error;
    }
  };

  const updateUserProfile = async (name: string, image: File | null) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    let photoURL = user.photoURL || '';
    
    if (image) {
      const storage = getStorage(auth.app);
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${image.name}`);
      const snapshot = await uploadBytes(storageRef, image);
      photoURL = await getDownloadURL(snapshot.ref);
    }
    
    await updateFirebaseProfile(user, { displayName: name, photoURL });
    
    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, { displayName: name, photoURL }, { merge: true });
    
    // Manually update local user state to reflect changes immediately
    setUser(auth.currentUser); 
    await fetchUserRole(auth.currentUser);
    setLoading(false);
  };

  const value = { user, loading, sessionRole, logout, signInWithGoogle, signInAsAdmin, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
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
