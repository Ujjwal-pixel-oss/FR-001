"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Loader2, LogOut, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function getFriendlyErrorMessage(error: any): string {
    const code = error?.code || "";
    const message = error?.message || "";

    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        return "Incorrect email or password. Please verify your credentials or create an account.";
    }
    if (code === "auth/email-already-in-use") {
        return "An account with this email already exists. Please switch to Sign In.";
    }
    if (code === "auth/weak-password") {
        return "Password is too weak. Please use at least 6 characters.";
    }
    if (code === "auth/invalid-email") {
        return "Please enter a valid email address.";
    }
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return "Google sign-in was closed before completion.";
    }
    if (code === "auth/too-many-requests") {
        return "Too many failed attempts. Please wait a few minutes before trying again.";
    }
    return message || "Authentication failed. Please try again.";
}

export default function UserLoginPage() {
    const { user, signInWithEmail, signInWithGoogle, signUpWithEmail, signOutUser, sendPasswordReset, loading } = useFirebaseAuth();
    const router = useRouter();
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [infoMsg, setInfoMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setInfoMsg("");
        setIsSubmitting(true);
        try {
            if (isSignup) {
                await signUpWithEmail(name.trim(), email.trim(), password);
            } else {
                await signInWithEmail(email.trim(), password);
            }
            router.push("/store");
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError("");
            setInfoMsg("");
            setIsSubmitting(true);
            await signInWithGoogle();
            router.push("/store");
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError("Please enter your email above to receive a password reset link.");
            return;
        }
        setError("");
        setResettingPassword(true);
        try {
            await sendPasswordReset(email.trim());
            setInfoMsg("Password reset link sent to your email!");
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setResettingPassword(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-black text-white">
            <div className="w-full max-w-sm flex flex-col gap-6">
                {/* Back button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Portals
                </Link>

                <div className="flex w-full flex-col gap-5 p-7 border border-zinc-800 rounded-2xl bg-zinc-950/80 shadow-2xl">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <User className="w-7 h-7 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white font-anton">
                                {isSignup ? "CREATE ACCOUNT" : "USER LOGIN"}
                            </h1>
                            <p className="text-xs text-zinc-400 mt-1">
                                {isSignup
                                    ? "Register to explore Balaji Luxmi hardware"
                                    : "Sign in to access your customer account"}
                            </p>
                        </div>
                    </div>

                    {!loading && user ? (
                        <div className="flex flex-col gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                            <p className="text-xs text-zinc-400">Currently authenticated as:</p>
                            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                            <div className="flex flex-col gap-2 pt-2">
                                <Button
                                    onClick={() => router.push("/store")}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                >
                                    Proceed to Store Catalog
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => signOutUser()}
                                    className="w-full border-zinc-700 text-zinc-300 hover:bg-white/5 gap-2"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                                {isSignup && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                            Your Name
                                        </label>
                                        <Input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                            Password
                                        </label>
                                        {!isSignup && (
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={resettingPassword}
                                                className="text-xs text-blue-400 hover:underline hover:text-blue-300"
                                            >
                                                {resettingPassword ? "Sending..." : "Forgot password?"}
                                            </button>
                                        )}
                                    </div>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        minLength={6}
                                        required
                                        className="bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {infoMsg && (
                                    <div className="p-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-lg flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                        <span>{infoMsg}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide mt-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait...</>
                                    ) : isSignup ? (
                                        "Create Account"
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setError("");
                                    setInfoMsg("");
                                }}
                                className="w-full text-xs text-zinc-400 hover:text-white"
                            >
                                {isSignup
                                    ? "Already have an account? Sign in"
                                    : "Need an account? Create one"}
                            </Button>

                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-zinc-800"></div>
                                <span className="flex-shrink mx-4 text-xs text-zinc-500 uppercase font-mono">Or</span>
                                <div className="flex-grow border-t border-zinc-800"></div>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                variant="outline"
                                disabled={isSubmitting}
                                className="w-full border-zinc-700 text-white hover:bg-white/5 font-medium"
                            >
                                Continue with Google
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}