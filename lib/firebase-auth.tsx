"use client";

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    type User,
    updateProfile,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { firebaseAuth } from "./firebase";
import { saveUserToFirestore } from "./firestore-users";

interface FirebaseAuthContextValue {
    user: User | null;
    loading: boolean;
    signUpWithEmail: (
        name: string,
        email: string,
        password: string,
    ) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(
    null,
);

export function FirebaseAuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return onAuthStateChanged(firebaseAuth, (nextUser) => {
            setUser(nextUser);
            setLoading(false);
        });
    }, []);

    const value: FirebaseAuthContextValue = {
        user,
        loading,
        signUpWithEmail: async (name, email, password) => {
            const credentials = await createUserWithEmailAndPassword(
                firebaseAuth,
                email,
                password,
            );
            await updateProfile(credentials.user, { displayName: name });
            await saveUserToFirestore(credentials.user, name);
        },
        signInWithEmail: async (email, password) => {
            const credentials = await signInWithEmailAndPassword(
                firebaseAuth,
                email,
                password,
            );
            await saveUserToFirestore(credentials.user);
        },
        signInWithGoogle: async () => {
            try {
                const credentials = await signInWithPopup(
                    firebaseAuth, 
                    new GoogleAuthProvider()
                );
                if (credentials?.user) {
                    await saveUserToFirestore(credentials.user);
                }
            } catch (error: any) {
                if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                    console.log("Login popup was closed.");
                    return;
                }
                console.error("Authentication Error:", error);
                throw error;
            }
        },
        signOutUser: () => signOut(firebaseAuth),
        sendPasswordReset: (email: string) => sendPasswordResetEmail(firebaseAuth, email),
        getIdToken: () => user?.getIdToken() ?? Promise.resolve(null),
    };

    return (
        <FirebaseAuthContext.Provider value={value}>
            {children}
        </FirebaseAuthContext.Provider>
    );
}

export function useFirebaseAuth() {
    const context = useContext(FirebaseAuthContext);
    if (!context) {
        throw new Error(
            "useFirebaseAuth must be used inside FirebaseAuthProvider",
        );
    }
    return context;
}
