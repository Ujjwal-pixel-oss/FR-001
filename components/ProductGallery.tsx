"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import ProductCard from "./ProductCard";
import ProductDialog from "./ProductDialog";
import { LayoutGrid, List, Grid3X3, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  products: Product[];
}

type ViewMode = "grid" | "list" | "gallery";

export default function ProductGallery({ products }: ProductGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  return (
    <section id="products" className="py-24 px-6 md:px-16 bg-background relative z-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-white/10 pb-8">
        <div>
            <span className="text-primary font-mono text-sm tracking-widest uppercase mb-2 block">Catalog 2025</span>
            <h2 className="text-5xl md:text-7xl font-bold text-foreground uppercase tracking-tighter">
            Our Products
            </h2>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-zinc-900/50 p-1 border border-white/10 rounded-none backdrop-blur-sm">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("grid")} 
                className={cn("rounded-none hover:bg-white/10 hover:text-white transition-all", viewMode === "grid" && "bg-primary text-white hover:bg-primary")}
            >
                <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("gallery")} 
                className={cn("rounded-none hover:bg-white/10 hover:text-white transition-all", viewMode === "gallery" && "bg-primary text-white hover:bg-primary")}
            >
                <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode("list")} 
                className={cn("rounded-none hover:bg-white/10 hover:text-white transition-all", viewMode === "list" && "bg-primary text-white hover:bg-primary")}
            >
                <List className="w-4 h-4" />
            </Button>
            </div>
            <Button variant="outline" className="rounded-none border-white/10 hover:bg-white/5 gap-2 hidden sm:flex">
                <Filter className="w-4 h-4" /> Filter
            </Button>
        </div>
      </div>

      <div className={cn(
          "grid gap-6",
          viewMode === "grid" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          viewMode === "gallery" && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
          viewMode === "list" && "grid-cols-1 max-w-4xl mx-auto"
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            onClick={handleProductClick}
          />
        ))}
      </div>

      <ProductDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
