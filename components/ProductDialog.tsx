"use client";

import { useFirebaseAuth } from "@/lib/firebase-auth";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/products";

import {
    Pencil,
    Loader2,
    Check,
    Truck,
    ArrowLeft,
    Plus,
    Minus,
    MapPin,
    Phone,
    User,
    Package,
    AlertCircle,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProductDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProductDeleted?: (id: string) => void;
}

type DialogMode = "details" | "ordering" | "editing" | "order_success";

export default function ProductDialog({
    product,
    open,
    onOpenChange,
    onProductDeleted,
}: ProductDialogProps) {
    const { user, getIdToken } = useFirebaseAuth();

    const [mode, setMode] = useState<DialogMode>("details");

    // Product Edit & Delete State
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [editSuccessMsg, setEditSuccessMsg] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: "",
        price: "",
        description: "",
    });

    // Cash on Delivery Order State
    const [quantity, setQuantity] = useState(1);
    const [customerData, setCustomerData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [orderNotes, setOrderNotes] = useState("");
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [orderError, setOrderError] = useState("");
    const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

    // Reset state when product or open state changes
    useEffect(() => {
        if (product) {
            setEditFormData({
                name: product.name,
                price: product.price || "",
                description: product.Description,
            });
            setQuantity(1);
            setMode("details");
            setOrderError("");
            setEditSuccessMsg("");
            setConfirmDelete(false);
            setConfirmedOrder(null);

            // Pre-fill customer data if logged in
            setCustomerData((prev) => ({
                ...prev,
                name: prev.name || user?.displayName || "",
                email: prev.email || user?.email || "",
            }));
        }
    }, [product, open, user]);

    if (!product) return null;

    // Calculate total price if product.price has numeric numbers
    const parsePrice = (priceStr: string | null): number | null => {
        if (!priceStr) return null;
        const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
        return isNaN(num) ? null : num;
    };

    const unitPriceNumber = parsePrice(product.price);
    const calculatedTotal = unitPriceNumber !== null ? unitPriceNumber * quantity : null;

    // Handle Admin Edit Submission
    const handleEditSubmit = async () => {
        setIsSubmittingEdit(true);
        try {
            const token = await getIdToken();
            const response = await fetch("/api/update-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    id: product.id,
                    ...editFormData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update product.");
            }

            setEditSuccessMsg("Product updated successfully in catalog!");
            setTimeout(() => {
                setMode("details");
                setEditSuccessMsg("");
            }, 1800);
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    // Handle Admin Delete Product
    const handleDeleteProduct = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setIsDeleting(true);
        try {
            const token = await getIdToken();
            const response = await fetch("/api/delete-product", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ id: product.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete product.");
            }

            onProductDeleted?.(product.id);
            onOpenChange(false);
            if (!onProductDeleted) {
                window.location.reload();
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    // Handle Cash on Delivery Order Submission
    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrderError("");

        // Validation
        if (!customerData.name.trim()) {
            setOrderError("Please enter your full name.");
            return;
        }
        if (!customerData.phone.trim() || customerData.phone.trim().length < 7) {
            setOrderError("Please enter a valid phone number so our courier can reach you.");
            return;
        }
        if (!customerData.address.trim()) {
            setOrderError("Please enter your delivery street address.");
            return;
        }
        if (!customerData.city.trim() || !customerData.pincode.trim()) {
            setOrderError("Please provide your City and Pincode.");
            return;
        }

        setIsSubmittingOrder(true);
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price,
                    productImage: product.path,
                    quantity,
                    customer: customerData,
                    notes: orderNotes,
                    userId: user?.uid || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to place order.");
            }

            setConfirmedOrder(data.order);
            setMode("order_success");
        } catch (err: any) {
            setOrderError(err.message || "Something went wrong placing your order. Please try again.");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-full sm:max-w-[620px] p-0 gap-0 bg-zinc-950 border-zinc-800 flex flex-col overflow-hidden text-white shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-800/80 flex-shrink-0 relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {mode === "ordering" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode("details")}
                                className="h-8 px-2 text-zinc-400 hover:text-white mr-1"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {mode === "editing" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode("details")}
                                className="h-8 px-2 text-zinc-400 hover:text-white mr-1"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <DialogTitle className="text-lg sm:text-2xl font-bold font-anton tracking-wide text-left text-white leading-tight">
                            {mode === "ordering" && "CASH ON DELIVERY CHECKOUT"}
                            {mode === "editing" && "EDIT PRODUCT"}
                            {mode === "order_success" && "ORDER CONFIRMED"}
                            {mode === "details" && product.name}
                        </DialogTitle>
                    </div>

                    {/* Admin Pencil Edit Icon */}
                    {mode === "details" && user && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMode("editing")}
                            title="Edit Product"
                            className="text-zinc-400 hover:text-white hover:bg-white/10"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    )}

                    <DialogDescription className="hidden">
                        Product Details, Cash on Delivery Checkout, and Management
                    </DialogDescription>
                </DialogHeader>

                {/* Body Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* MODE 1: DETAILS */}
                    {mode === "details" && (
                        <div className="space-y-4 sm:space-y-5">
                            {/* Product Image - compact responsive height so everything is immediately visible */}
                            <div className="relative w-full h-[200px] sm:h-[240px] overflow-hidden rounded-xl border border-white/10 bg-black/50 group">
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src={product.path}
                                        alt={product.name}
                                        fill
                                        className="object-cover blur-2xl opacity-40 scale-110"
                                    />
                                </div>
                                <div className="relative z-10 w-full h-full p-2">
                                    <Image
                                        src={product.path}
                                        alt={product.name}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Product Info & Pricing */}
                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between border-b border-zinc-800 pb-3">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-zinc-400">ID: {product.id}</span>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white font-anton tracking-wide mt-0.5">
                                            {product.name}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Unit Price</span>
                                        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-anton tracking-wide">
                                            {product.price ? (product.price.startsWith("₹") ? product.price : `₹${product.price}`) : "Inquire"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                                        Product Specifications & Description
                                    </h4>
                                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-manrope bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                                        {product.Description || "High quality industrial grade hardware by Balaji Luxmi."}
                                    </p>
                                </div>

                                {/* Trust Highlights */}
                                <div className="grid grid-cols-2 gap-2.5 pt-1">
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
                                        <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span>Cash on Delivery</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                        <span>Genuine Hardware</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE 2: CASH ON DELIVERY ORDER FORM */}
                    {mode === "ordering" && (
                        <form id="cod-order-form" onSubmit={handleOrderSubmit} className="space-y-4">
                            {/* Product Summary Mini Card */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-zinc-800">
                                        <Image
                                            src={product.path}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-[220px]">
                                            {product.name}
                                        </h4>
                                        <p className="text-xs text-emerald-400 font-semibold font-mono">
                                            {product.price ? `₹${product.price}` : "Quote on Delivery"}
                                        </p>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-zinc-400 mr-1 hidden sm:inline">Qty:</span>
                                    <div className="flex items-center border border-zinc-700 rounded-lg bg-black/50 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="px-2 text-xs font-bold font-mono text-white">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Total Calculation Banner */}
                            {calculatedTotal !== null && (
                                <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-xs">
                                    <span className="text-zinc-300">
                                        Total Cash to Pay on Delivery:
                                    </span>
                                    <span className="text-base sm:text-lg font-bold font-anton text-emerald-400">
                                        ₹{calculatedTotal.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            )}

                            {/* Delivery Details Form */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Delivery Address & Contact
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-zinc-400 uppercase font-semibold">
                                            Full Name *
                                        </Label>
                                        <Input
                                            required
                                            value={customerData.name}
                                            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                            placeholder="e.g. Ramesh Kumar"
                                            className="bg-zinc-900/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs sm:text-sm h-9"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-zinc-400 uppercase font-semibold">
                                            Phone Number *
                                        </Label>
                                        <Input
                                            required
                                            type="tel"
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="bg-zinc-900/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs sm:text-sm h-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] text-zinc-400 uppercase font-semibold">
                                        Street Address / House No. / Landmark *
                                    </Label>
                                    <Textarea
                                        required
                                        value={customerData.address}
                                        onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                        placeholder="Flat / Shop No., Building Name, Street / Road, Landmark"
                                        rows={2}
                                        className="bg-zinc-900/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs sm:text-sm resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-zinc-400 uppercase font-semibold">
                                            City *
                                        </Label>
                                        <Input
                                            required
                                            value={customerData.city}
                                            onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                                            placeholder="Delhi"
                                            className="bg-zinc-900/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs sm:text-sm h-9"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-zinc-400 uppercase font-semibold">
                                            State
                                        </Label>
                                        <Input
                                            value={customerData.state}
                                            onChange={(e) => setCustomerData({ ...customerData, state: e.target.value })}
                                            placeholder="Delhi"
                                            className="bg-zinc-900/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs sm:text-sm h-9"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-zinc-400 uppercase font-semibold">
                                            Pincode *
                                        </Label>
                                        <Input
                                            required
                                            value={customerData.pincode}
                                            onChange={(e) => setCustomerData({ ...customerData, pincode: e.target.value })}
                                            placeholder="110006"
                                            className="bg-zinc-900/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs sm:text-sm h-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] text-zinc-400 uppercase font-semibold">
                                        Optional Delivery Notes
                                    </Label>
                                    <Input
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        placeholder="e.g. Call before delivery, deliver in afternoon"
                                        className="bg-zinc-900/90 border-zinc-700 text-white placeholder:text-zinc-500 text-xs sm:text-sm h-9"
                                    />
                                </div>
                            </div>

                            {/* Error Alert */}
                            {orderError && (
                                <div className="p-2.5 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{orderError}</span>
                                </div>
                            )}
                        </form>
                    )}

                    {/* MODE 3: ORDER SUCCESS */}
                    {mode === "order_success" && confirmedOrder && (
                        <div className="py-4 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center">
                                <Check className="w-7 h-7 text-emerald-400" />
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                                    Order ID: {confirmedOrder.orderReferenceId}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-bold font-anton text-white tracking-wide mt-2">
                                    ORDER PLACED SUCCESSFULLY!
                                </h3>
                                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                                    Thank you! Your Cash on Delivery order has been registered in our Firebase database.
                                </p>
                            </div>

                            {/* Order Details Receipt */}
                            <div className="w-full max-w-md p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2 text-xs">
                                <div className="flex justify-between pb-1.5 border-b border-zinc-800">
                                    <span className="text-zinc-400">Item:</span>
                                    <span className="font-bold text-white">{confirmedOrder.productName} (x{confirmedOrder.quantity})</span>
                                </div>
                                <div className="flex justify-between pb-1.5 border-b border-zinc-800">
                                    <span className="text-zinc-400">Total Amount:</span>
                                    <span className="font-bold text-emerald-400">{confirmedOrder.totalAmount}</span>
                                </div>
                                <div className="flex justify-between pb-1.5 border-b border-zinc-800">
                                    <span className="text-zinc-400">Payment:</span>
                                    <span className="font-bold text-zinc-200">Cash on Delivery</span>
                                </div>
                                <div>
                                    <span className="text-zinc-400 block mb-0.5">Delivering to:</span>
                                    <p className="text-zinc-200 font-medium">
                                        {confirmedOrder.customer?.name} ({confirmedOrder.customer?.phone})
                                    </p>
                                    <p className="text-zinc-400">
                                        {confirmedOrder.customer?.address}, {confirmedOrder.customer?.city}, {confirmedOrder.customer?.pincode}
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    setMode("details");
                                    onOpenChange(false);
                                }}
                                className="w-full max-w-md bg-white text-black hover:bg-zinc-200 font-bold"
                            >
                                Done & Back to Catalog
                            </Button>
                        </div>
                    )}

                    {/* MODE 4: ADMIN EDIT PRODUCT */}
                    {mode === "editing" && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                            {editSuccessMsg ? (
                                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900 text-center text-emerald-300 font-semibold text-sm">
                                    ✓ {editSuccessMsg}
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Product Name</Label>
                                        <Input
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white focus:border-emerald-500 transition-all text-sm h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Price</Label>
                                        <Input
                                            value={editFormData.price}
                                            onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white focus:border-emerald-500 transition-all text-sm h-9"
                                            placeholder="e.g. 500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Description</Label>
                                        <Textarea
                                            value={editFormData.description}
                                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white focus:border-emerald-500 min-h-[100px] transition-all text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setMode("details")}
                                            disabled={isSubmittingEdit}
                                            className="border-white/10 text-zinc-400 hover:text-white"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleEditSubmit}
                                            disabled={isSubmittingEdit || isDeleting}
                                            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
                                        >
                                            {isSubmittingEdit ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </Button>
                                    </div>

                                    {/* Danger Zone: Delete Product */}
                                    <div className="pt-4 border-t border-zinc-800/80">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/20 border border-red-900/40">
                                            <div>
                                                <h5 className="text-xs font-bold text-red-400">Delete Product</h5>
                                                <p className="text-[11px] text-zinc-400">Permanently remove from catalog</p>
                                            </div>
                                            {confirmDelete ? (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={isDeleting}
                                                        onClick={() => setConfirmDelete(false)}
                                                        className="text-zinc-400 hover:text-white text-xs h-8"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={isDeleting}
                                                        onClick={handleDeleteProduct}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-8 px-3 gap-1.5"
                                                    >
                                                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                        Confirm Delete
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setConfirmDelete(true)}
                                                    className="border-red-900/60 text-red-400 hover:bg-red-950/40 hover:text-red-300 text-xs h-8 px-3 gap-1.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* STICKY ACTION FOOTER (ALWAYS VISIBLE - NO SCROLLING REQUIRED!) */}
                {mode === "details" && (
                    <div className="p-3.5 sm:px-6 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Cash on Delivery
                            </span>
                            <span className="text-xl sm:text-2xl font-bold font-anton text-white tracking-wide truncate">
                                {product.price ? (product.price.startsWith("₹") ? product.price : `₹${product.price}`) : "Inquire"}
                            </span>
                        </div>
                        <Button
                            onClick={() => setMode("ordering")}
                            className="flex-1 max-w-[280px] sm:max-w-[320px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-emerald-950/60"
                        >
                            <Truck className="w-4 h-4" /> ORDER ON COD
                        </Button>
                    </div>
                )}

                {/* STICKY FOOTER IN ORDERING MODE */}
                {mode === "ordering" && (
                    <div className="p-3.5 sm:px-6 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMode("details")}
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                        >
                            Back
                        </Button>
                        <Button
                            form="cod-order-form"
                            type="submit"
                            disabled={isSubmittingOrder}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-emerald-950/60"
                        >
                            {isSubmittingOrder ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...
                                </>
                            ) : (
                                "CONFIRM ORDER (COD)"
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}