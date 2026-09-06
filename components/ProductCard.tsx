"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list" | "gallery";
  onClick: (product: Product) => void;
}

export default function ProductCard({
  product,
  viewMode,
  onClick,
}: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hover animations handled via CSS group-hover for performance
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, product: Product) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(product);
    }
  };

  if (viewMode === "list") {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: handled by onKeyDown
      <div
        onClick={() => onClick(product)}
        onKeyDown={(e) => handleKeyDown(e, product)}
        role="button"
        tabIndex={0}
        className="group relative flex items-center gap-6 p-6 rounded-none border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer overflow-hidden"
      >
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-black/20">
            <Image
                src={product.path}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    COD AVAILABLE
                </span>
                {product.price && (
                    <span className="text-sm font-bold font-anton text-emerald-400">
                        {product.price.startsWith("₹") ? product.price : `₹${product.price}`}
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">{product.name}</h3>
            <p className="text-zinc-400 line-clamp-2 font-mono text-sm">{product.Description}</p>
        </div>
        <div className="p-4 rounded-full border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
            <ArrowUpRight className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: handled by onKeyDown
    <div
      ref={cardRef}
      onClick={() => onClick(product)}
      onKeyDown={(e) => handleKeyDown(e, product)}
      role="button"
      tabIndex={0}
      className={cn(
        "group relative overflow-hidden bg-zinc-900/50 border border-white/10 cursor-pointer transition-all duration-500 hover:border-primary/50",
        viewMode === "gallery" ? "aspect-[3/4]" : "aspect-square"
      )}
    >
      {/* Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          ref={imageRef}
          src={product.path}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0 grayscale-[0.5]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Technical Overlay (Blueprint Effect) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="border-l-2 border-primary pl-4">
            <h3 className="text-white font-bold text-2xl uppercase tracking-tighter leading-none mb-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
            {product.name}
            </h3>
            <p className="text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 flex items-center gap-1">
              <span>Order on COD</span> • <span>Details</span>
            </p>
        </div>
      </div>

      {/* COD Available Badge */}
      <div className="absolute top-4 left-4 z-20">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-950/80 text-emerald-400 border border-emerald-800/70 backdrop-blur-md shadow-md">
          COD AVAILABLE
        </span>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20 group-hover:border-primary transition-colors duration-300 z-20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20 group-hover:border-primary transition-colors duration-300 z-20" />
      
      {/* Icon */}
      <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
        <ArrowUpRight className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
