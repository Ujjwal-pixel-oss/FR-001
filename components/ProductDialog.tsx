"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/products";

import { useState } from "react";
import { Pencil, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProductDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ProductDialog({
    product,
    open,
    onOpenChange,
}: ProductDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
    });

    // Reset state when dialog opens/closes or product changes
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price || "",
                description: product.Description,
            });
            setIsEditing(false);
            setSuccessMessage("");
        }
    }, [product, open]);

    if (!product) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/update-product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: product.id,
                    ...formData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update");
            }

            setSuccessMessage("Update request submitted successfully! A Pull Request has been created.");
            setIsEditing(false);
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-full sm:max-w-[600px] p-0 gap-0 bg-zinc-950 border-zinc-800 flex flex-col overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-white/10 flex-shrink-0 relative flex items-center justify-center">
                    <DialogTitle className="text-2xl font-bold text-white font-anton tracking-wide text-center w-full px-12 leading-tight">
                        {isEditing ? "EDIT PRODUCT" : product.name}
                    </DialogTitle>
                    {!isEditing && !successMessage && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(true)}
                                className="text-zinc-400 hover:text-white hover:bg-white/10"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    <DialogDescription className="hidden">
                        Product Details and Edit Form
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {successMessage ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Request Sent!</h3>
                                <p className="text-zinc-400 max-w-xs mx-auto">{successMessage}</p>
                            </div>
                            <Button onClick={() => onOpenChange(false)} className="bg-white text-black hover:bg-zinc-200">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {/* Image Section - Adaptive Height */}
                            <div className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 group transition-all duration-300 ${isEditing ? 'h-40' : 'h-[300px] sm:h-[400px]'}`}>
                                {/* Blurred Background */}
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src={product.path}
                                        alt={product.name}
                                        fill
                                        className="object-cover blur-2xl opacity-40 scale-110"
                                    />
                                </div>
                                
                                {/* Main Image */}
                                <div className="relative z-10 w-full h-full p-4">
                                    <Image
                                        src={product.path}
                                        alt={product.name}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                    />
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Product Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Price</Label>
                                        <Input
                                            value={formData.price}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                                            placeholder="e.g. ₹500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white focus:border-orange-500 focus:ring-orange-500/20 min-h-[120px] transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-zinc-950 pb-2 -mb-2">
                                        <Button 
                                            onClick={handleSubmit} 
                                            disabled={isSubmitting}
                                            className="flex-1 bg-orange-600 text-white hover:bg-orange-700 font-bold tracking-wide"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    PROCESSING...
                                                </>
                                            ) : (
                                                "SUBMIT UPDATE"
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsEditing(false)}
                                            disabled={isSubmitting}
                                            className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                                        >
                                            CANCEL
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                            Description
                                        </h4>
                                        <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-line font-manrope">
                                            {product.Description}
                                        </p>
                                    </div>
                                    {product.price && (
                                        <div className="pt-4 border-t border-white/10">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                                Price
                                            </h4>
                                            <p className="text-3xl font-bold text-white font-anton tracking-wide">
                                                {product.price}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
