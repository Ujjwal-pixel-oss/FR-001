"use client";

import Link from "next/link";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutGrid, ShieldCheck } from "lucide-react";

export default function StoreNav() {
    const { user, signOutUser, loading } = useFirebaseAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-black/70 backdrop-blur-md border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                <span className="font-extrabold tracking-wider font-anton text-lg">
                    BALAJI LUXMI
                </span>
            </Link>

            <div className="flex items-center gap-3">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Portals</span>
                    </Button>
                </Link>

                {!loading && (
                    <>
                        {user ? (
                            <div className="flex items-center gap-2.5">
                                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-zinc-300">
                                    <User className="w-3 h-3 text-blue-400" />
                                    <span className="max-w-[140px] truncate">{user.displayName || user.email}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => signOutUser()}
                                    className="border-zinc-700 hover:bg-red-950/40 hover:border-red-800 text-zinc-300 hover:text-red-300 gap-1.5 text-xs"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign Out</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button size="sm" variant="outline" className="border-zinc-700 text-white hover:bg-white/10 text-xs">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/admin">
                                    <Button size="sm" className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                                        Admin
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </header>
    );
}
