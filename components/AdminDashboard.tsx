"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import type { Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductDialog from "@/components/ProductDialog";
import AddProductDialog from "@/components/AddProductDialog";
import {
    ShieldCheck,
    LogOut,
    Plus,
    Search,
    ExternalLink,
    Package,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    Pencil,
    RefreshCw,
    Truck,
    ShoppingBag,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Check,
} from "lucide-react";

function getFriendlyErrorMessage(error: any): string {
    const code = error?.code || "";
    const message = error?.message || "";

    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        return "Incorrect email or password. Please verify your credentials or register an account.";
    }
    if (code === "auth/email-already-in-use") {
        return "An account with this email already exists. Try signing in.";
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

interface AdminDashboardProps {
    initialProducts: Product[];
}

export default function AdminDashboard({ initialProducts }: AdminDashboardProps) {
    const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser, sendPasswordReset } = useFirebaseAuth();
    const router = useRouter();

    // Login Form State
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [infoMsg, setInfoMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);

    // Active Dashboard Tab
    const [activeTab, setActiveTab] = useState<"inventory" | "orders">("inventory");

    // Inventory State
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    // Orders State
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderSearchQuery, setOrderSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    // Fetch Orders from API
    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (data.success && data.orders) {
                setOrders(data.orders);
            }
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    // Handle Order Status Update
    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        try {
            const res = await fetch("/api/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });
            if (res.ok) {
                setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
                );
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // Filter products
    const filteredProducts = products.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.Description?.toLowerCase().includes(query)
        );
    });

    // Filter orders
    const filteredOrders = orders.filter((o) => {
        const matchesQuery =
            o.orderReferenceId?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            o.customer?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            o.customer?.phone?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            o.productName?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            o.customer?.city?.toLowerCase().includes(orderSearchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || o.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesQuery && matchesStatus;
    });

    const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setInfoMsg("");
        setIsSubmitting(true);
        try {
            if (isSignup) {
                await signUpWithEmail("Admin", email.trim(), password);
            } else {
                await signInWithEmail(email.trim(), password);
            }
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
        } catch (err: any) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError("Please enter your admin email above first.");
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

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setEditDialogOpen(true);
    };

    // 1. Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    <p className="text-sm font-mono text-zinc-400">Verifying session...</p>
                </div>
            </div>
        );
    }

    // 2. Unauthenticated State -> Show Admin Sign In Form
    if (!user) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-black text-white">
                <div className="w-full max-w-md flex flex-col gap-6">
                    {/* Back to Home button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Portals
                    </Link>

                    <div className="flex flex-col gap-6 p-8 border border-zinc-800 rounded-2xl bg-zinc-950/80 shadow-2xl">
                        {/* Header */}
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                <ShieldCheck className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white font-anton">
                                    {isSignup ? "REGISTER ADMIN" : "ADMIN PORTAL"}
                                </h1>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {isSignup
                                        ? "Create your administrator account for Balaji Luxmi"
                                        : "Authorized access to inventory, pricing, and catalog controls"}
                                </p>
                            </div>
                        </div>

                        {/* Sign-in / Sign-up Form */}
                        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Admin Email
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@balajiluxmi.com"
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
                                            className="text-xs text-green-400 hover:underline hover:text-green-300"
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
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide mt-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                                ) : isSignup ? (
                                    "Create Admin Account"
                                ) : (
                                    "Sign In to Admin Portal"
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
                                : "Need to register admin credentials? Create one"}
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
                    </div>
                </div>
            </div>
        );
    }

    // 3. Authenticated Admin Dashboard
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wider font-anton">
                            BALAJI LUXMI <span className="text-green-500 text-sm font-sans font-semibold ml-2 px-2 py-0.5 rounded bg-green-950/50 border border-green-800">ADMIN</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>

                    <Link href="/store" target="_blank">
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/10 text-xs gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">View Store</span>
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOutUser()}
                        className="text-zinc-400 hover:text-red-400 hover:bg-red-950/20 text-xs gap-1.5"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
                {/* Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-zinc-800">
                    <div className="flex gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab("inventory")}
                            className={`pb-3 px-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
                                activeTab === "inventory"
                                    ? "border-green-500 text-white"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            <Package className="w-4 h-4" />
                            <span>INVENTORY ({products.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("orders")}
                            className={`pb-3 px-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 relative ${
                                activeTab === "orders"
                                    ? "border-emerald-500 text-white"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>CUSTOMER ORDERS (COD) ({orders.length})</span>
                            {pendingOrdersCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black ml-1">
                                    {pendingOrdersCount} new
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="pb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                router.refresh();
                                fetchOrders();
                            }}
                            className="text-zinc-400 hover:text-white text-xs gap-1.5 h-8"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </div>

                {/* TAB 1: INVENTORY MANAGEMENT */}
                {activeTab === "inventory" && (
                    <div className="space-y-8 animate-in fade-in-50 duration-200">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Catalog Items</p>
                                    <h3 className="text-3xl font-extrabold font-anton mt-1 text-white">{products.length}</h3>
                                    <p className="text-xs text-green-400 mt-1">Live in store catalog</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-zinc-300">
                                    <Package className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">System Health</p>
                                    <h3 className="text-2xl font-bold mt-1 text-emerald-400 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Online
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">Firebase Backend & Storage Active</p>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Access Level</p>
                                    <h3 className="text-2xl font-bold mt-1 text-white flex items-center gap-1.5">
                                        Super Admin
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">Full edit and create permissions</p>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-green-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Controls & Search Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                            <div className="relative w-full sm:w-80">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products by name or ID..."
                                    className="pl-9 bg-zinc-900/90 border-zinc-800 text-sm text-white placeholder:text-zinc-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <Button
                                    onClick={() => setAddDialogOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide flex items-center gap-2 text-xs sm:text-sm px-4"
                                >
                                    <Plus className="w-4 h-4" /> ADD NEW PRODUCT
                                </Button>
                            </div>
                        </div>

                        {/* Product Inventory Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold font-anton tracking-wide text-zinc-200">
                                    INVENTORY MANAGEMENT ({filteredProducts.length})
                                </h2>
                            </div>

                            {filteredProducts.length === 0 ? (
                                <div className="p-12 text-center rounded-xl border border-zinc-800 bg-zinc-950/50">
                                    <p className="text-zinc-400 text-sm">No products found matching &ldquo;{searchQuery}&rdquo;</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 transition-all group"
                                        >
                                            <div className="flex gap-4 items-start">
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                                                    <Image
                                                        src={product.path}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                                        {product.id}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-white mt-1 truncate group-hover:text-green-400 transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                                                        {product.Description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
                                                <span className="text-sm font-bold font-anton text-zinc-200">
                                                    {product.price ? `₹${product.price}` : "No price set"}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditProduct(product)}
                                                    className="border-zinc-700 hover:bg-white/10 text-white text-xs gap-1.5 h-8"
                                                >
                                                    <Pencil className="w-3 h-3" /> Edit
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: CUSTOMER ORDERS (COD) */}
                {activeTab === "orders" && (
                    <div className="space-y-6 animate-in fade-in-50 duration-200">
                        {/* Orders Stats Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Total Orders Placed</p>
                                    <h3 className="text-3xl font-extrabold font-anton mt-1 text-white">{orders.length}</h3>
                                    <p className="text-xs text-zinc-400 mt-1">Saved in Firebase</p>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Pending Confirmation</p>
                                    <h3 className="text-3xl font-extrabold font-anton mt-1 text-amber-400">
                                        {pendingOrdersCount}
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">Awaiting dispatch</p>
                                </div>
                                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Payment Mode</p>
                                    <h3 className="text-2xl font-bold mt-1 text-emerald-400 flex items-center gap-2">
                                        Cash on Delivery
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">Doorstep cash collection</p>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                    <Truck className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Search & Status Filters */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                            <div className="relative w-full sm:w-80">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    type="text"
                                    value={orderSearchQuery}
                                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                                    placeholder="Search by name, phone, city, or Order ID..."
                                    className="pl-9 bg-zinc-900/90 border-zinc-800 text-sm text-white placeholder:text-zinc-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                                {["all", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => setStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors border ${
                                            statusFilter === st
                                                ? "bg-white text-black border-white"
                                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                                        }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Orders List */}
                        {loadingOrders ? (
                            <div className="p-12 text-center rounded-xl border border-zinc-800 bg-zinc-950/50 flex flex-col items-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                                <p className="text-zinc-400 text-sm font-mono">Loading orders from Firebase...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="p-12 text-center rounded-xl border border-zinc-800 bg-zinc-950/50">
                                <p className="text-zinc-400 text-sm">No orders found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                                    >
                                        {/* Order Info & Product */}
                                        <div className="flex gap-4 items-start">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                                                <Image
                                                    src={order.productImage || "/images/placeholder.jpg"}
                                                    alt={order.productName || "Product"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                                                        {order.orderReferenceId}
                                                    </span>
                                                    <span
                                                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                                                            order.status === "Delivered"
                                                                ? "bg-green-950 text-green-400 border border-green-800"
                                                                : order.status === "Confirmed"
                                                                ? "bg-blue-950 text-blue-400 border border-blue-800"
                                                                : order.status === "Cancelled"
                                                                ? "bg-red-950 text-red-400 border border-red-800"
                                                                : "bg-amber-950 text-amber-400 border border-amber-800"
                                                        }`}
                                                    >
                                                        {order.status || "Pending"}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 font-mono">
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : ""}
                                                    </span>
                                                </div>

                                                <h4 className="text-base font-bold text-white font-anton tracking-wide">
                                                    {order.productName} <span className="text-zinc-400 font-mono text-xs">(Qty: {order.quantity})</span>
                                                </h4>

                                                <p className="text-sm font-bold font-anton text-emerald-400">
                                                    Total: {order.totalAmount} <span className="text-xs font-sans font-normal text-zinc-400">• Cash on Delivery</span>
                                                </p>
                                                {order.notes && (
                                                    <p className="text-xs text-zinc-400 italic">
                                                        Note: &ldquo;{order.notes}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Customer Credentials & Address Card */}
                                        <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-xs space-y-1.5 min-w-[280px]">
                                            <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                                                <span>Customer:</span>
                                                <span className="text-white">{order.customer?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-zinc-300">
                                                <Phone className="w-3 h-3 text-emerald-400" />
                                                <a
                                                    href={`tel:${order.customer?.phone}`}
                                                    className="text-emerald-400 hover:underline font-mono font-semibold"
                                                >
                                                    {order.customer?.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-start gap-1.5 text-zinc-400">
                                                <MapPin className="w-3 h-3 text-zinc-500 mt-0.5 flex-shrink-0" />
                                                <span>
                                                    {order.customer?.address}, {order.customer?.city}, {order.customer?.state} - <strong className="text-zinc-300">{order.customer?.pincode}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Update Actions */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
                                            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 hidden sm:block">
                                                Update Status
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <select
                                                    disabled={updatingOrderId === order.id}
                                                    value={order.status || "Pending"}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                {updatingOrderId === order.id && (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Product Dialog for Editing */}
            <ProductDialog
                product={selectedProduct}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />

            {/* Add Product Dialog */}
            <AddProductDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
            />
        </div>
    );
}
