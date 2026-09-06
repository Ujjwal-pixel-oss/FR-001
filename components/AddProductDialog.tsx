import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Check, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { auth } from "@/lib/firebase"; // <-- 1. Import Firebase auth

interface AddProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        imageBase64: "", 
        imageName: "",
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
            
            const base64Data = base64String.split(',')[1];
            
            setFormData({
                ...formData,
                imageBase64: base64Data,
                imageName: file.name
            });
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData({ ...formData, imageBase64: "", imageName: "" });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 2. Check if the user is logged in via Firebase
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error("You must be logged in as an admin to add products.");
            }

            // 3. Get the secure Firebase ID token
            const token = await currentUser.getIdToken();

            const response = await fetch("/api/add-product", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // 4. Send token in headers
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add product");
            }

            setSuccessMessage("Success! Your product has been added to Firebase and Storage.");
            
            setFormData({ name: "", price: "", description: "", imageBase64: "", imageName: "" }); 
            setImagePreview(null);
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
                <DialogHeader className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold text-white font-anton tracking-wide">
                        ADD NEW PRODUCT
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {successMessage ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Product Added!</h3>
                                <p className="text-zinc-400 max-w-xs mx-auto">{successMessage}</p>
                            </div>
                            <Button onClick={() => { onOpenChange(false); setSuccessMessage(""); }} className="bg-white text-black hover:bg-zinc-200">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Product Image *</Label>
                                
                                {imagePreview ? (
                                    <div className="relative w-full h-48 rounded-xl border border-white/10 bg-black/40 overflow-hidden group">
                                        <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                                        <button 
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:border-green-500/50 hover:text-green-500 transition-colors bg-white/5">
                                            <Upload className="w-6 h-6 mb-2" />
                                            <span className="text-sm font-medium">Click or drag image to upload</span>
                                            <span className="text-xs mt-1 opacity-70">Max size: 2MB</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Product Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus:border-green-500 focus:ring-green-500/20"
                                    placeholder="e.g. Premium Brass Hinges"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Price</Label>
                                <Input
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus:border-green-500 focus:ring-green-500/20"
                                    placeholder="e.g. ₹850"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Description *</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white focus:border-green-500 focus:ring-green-500/20 min-h-[120px]"
                                    placeholder="Write a detailed description..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4 sticky bottom-0 bg-zinc-950 pb-2 -mb-2">
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting || !formData.name || !formData.description || !formData.imageBase64}
                                    className="flex-1 bg-green-600 text-white hover:bg-green-700 font-bold tracking-wide"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...</>
                                    ) : (
                                        "ADD PRODUCT"
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                    className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    CANCEL
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}