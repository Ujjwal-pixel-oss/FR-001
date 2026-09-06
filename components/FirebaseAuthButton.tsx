"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function FirebaseAuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for login/logout changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe(); // Cleanup subscription
    }, []);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (loading) {
        return <div className="h-9 w-24 bg-zinc-800 animate-pulse rounded-md"></div>;
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400 hidden sm:inline-block">
                    {user.email}
                </span>
                <Button onClick={handleLogout} variant="outline" className="border-white/10 hover:bg-white/5">
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={handleLogin} className="bg-white text-black hover:bg-zinc-200 font-semibold">
            Admin Login
        </Button>
    );
}