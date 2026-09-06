"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User, ArrowRight, LogOut } from "lucide-react";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import Link from "next/link";

export default function RoleSelectorPage() {
    const router = useRouter();
    const { user, signOutUser, loading } = useFirebaseAuth();

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-black text-white p-4">
            <div className="text-center space-y-2">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wider font-anton">
                    BALAJI LUXMI
                </h1>
                <p className="text-zinc-400 text-sm">Please select your portal to continue</p>
            </div>

            {/* If user is already authenticated */}
            {!loading && user && (
                <div className="w-full max-w-md p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="truncate">
                            <p className="text-xs text-zinc-400">Signed in as</p>
                            <p className="text-xs font-semibold text-white truncate">
                                {user.displayName || user.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => router.push("/store")}
                            className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold"
                        >
                            Open Store
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => signOutUser()}
                            className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 p-2 h-8 w-8"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Portal Cards */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                {/* Admin Portal Card */}
                <Button
                    onClick={() => router.push("/admin")}
                    className="flex-1 h-32 flex flex-col items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:bg-zinc-850 text-white rounded-2xl group transition-all"
                >
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-green-500/10 transition-colors">
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <span className="font-bold tracking-wide">Login as Admin</span>
                </Button>

                {/* User Portal Card */}
                <Button
                    onClick={() => router.push("/login")}
                    className="flex-1 h-32 flex flex-col items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-850 text-white rounded-2xl group transition-all"
                >
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                        <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="font-bold tracking-wide">Login as User</span>
                </Button>
            </div>

            {/* Guest / Direct Store Link */}
            <div className="pt-2">
                <Link
                    href="/store"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
                >
                    <span>Browse Product Catalog as Guest</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}