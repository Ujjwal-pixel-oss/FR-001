"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { QrCode, X, ArrowRight } from "lucide-react";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLHeadingElement>(null);
  const titleLine2Ref = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const mobileQrRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const blob4Ref = useRef<HTMLDivElement>(null);
  const qrBlob1Ref = useRef<HTMLDivElement>(null);
  const qrBlob2Ref = useRef<HTMLDivElement>(null);
  const qrBlob3Ref = useRef<HTMLDivElement>(null);
  const mobileBlob1Ref = useRef<HTMLDivElement>(null);
  const mobileBlob2Ref = useRef<HTMLDivElement>(null);
  const mobileBlob3Ref = useRef<HTMLDivElement>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [showMobileQr, setShowMobileQr] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }

    const ctx = gsap.context(() => {
      // Entrance animations
      const tl = gsap.timeline();

      tl.from(titleLine1Ref.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      })
        .from(
          titleLine2Ref.current,
          {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
          },
          "-=0.8"
        )
        .from(
          descRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.6"
        )
        .from(
          qrRef.current,
          {
            scale: 0.8,
            opacity: 0,
            duration: 1,
            ease: "back.out(1.7)",
          },
          "-=0.8"
        );
        
      // Organic "AI Blob" Animations
      // Random movement for blobs
      const blobs = [
        blob1Ref.current, 
        blob2Ref.current, 
        blob3Ref.current, 
        blob4Ref.current,
        qrBlob1Ref.current,
        qrBlob2Ref.current,
        qrBlob3Ref.current,
        mobileBlob1Ref.current,
        mobileBlob2Ref.current,
        mobileBlob3Ref.current
      ];
      
      blobs.forEach((blob, i) => {
        if (!blob) return;
        
        // Randomize start position slightly
        gsap.set(blob, {
          x: gsap.utils.random(-20, 20),
          y: gsap.utils.random(-20, 20),
          scale: gsap.utils.random(0.8, 1.2),
        });

        // Continuous organic movement
        gsap.to(blob, {
          x: `random(-30, 30)`,
          y: `random(-30, 30)`,
          scale: `random(0.9, 1.3)`,
          duration: gsap.utils.random(4, 7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5,
        });
        
        // Subtle opacity pulse (handled by hover for QR, but we can add base pulse)
        if (blob !== qrBlob1Ref.current && blob !== qrBlob2Ref.current && blob !== qrBlob3Ref.current) {
            gsap.to(blob, {
                opacity: `random(0.3, 0.6)`,
                duration: gsap.utils.random(2, 4),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.3,
            });
        }
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (showMobileQr) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          pointerEvents: "none",
        });

        gsap.set(mobileQrRef.current, { display: "flex" });
        gsap.fromTo(mobileQrRef.current,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.3, delay: 0.1 }
        );
      } else {
        gsap.to(mobileQrRef.current, {
          autoAlpha: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => {
            gsap.set(mobileQrRef.current, { display: "none" });
          }
        });

        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          pointerEvents: "auto",
          delay: 0.1,
        });
      }
    }, heroRef);
    return () => ctx.revert();
  }, [showMobileQr]);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-[85vh] flex flex-col md:flex-row items-center justify-center px-6 md:px-16 overflow-hidden pt-20 md:pt-0"
    >
      {/* Industrial Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Main Content */}
      {/* Main Content */}
      <div ref={contentRef} className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-center md:text-left relative">
          
          <div className="relative inline-block">
            {/* White/Silver AI Blobs */}
            <div ref={blob1Ref} className="absolute top-1/2 left-1/4 w-[80%] h-[100%] bg-white/50 blur-[50px] rounded-full pointer-events-none -z-10 mix-blend-plus-lighter" />
            <div ref={blob2Ref} className="absolute top-1/2 right-1/4 w-[70%] h-[80%] bg-zinc-400/50 blur-[40px] rounded-full pointer-events-none -z-10 mix-blend-plus-lighter" />
            
            <div className="overflow-hidden">
                <h1 ref={titleLine1Ref} className="text-[12vw] md:text-[8rem] leading-[0.85] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 uppercase drop-shadow-xl">
                BALAJI
                </h1>
            </div>
          </div>

          <div className="relative inline-block">
            {/* Orange AI Blobs */}
            <div ref={blob3Ref} className="absolute top-1/2 left-1/3 w-[90%] h-[100%] bg-primary/60 blur-[60px] rounded-full pointer-events-none -z-10 mix-blend-plus-lighter" />
            <div ref={blob4Ref} className="absolute top-1/2 right-1/3 w-[80%] h-[90%] bg-orange-500/50 blur-[50px] rounded-full pointer-events-none -z-10 mix-blend-plus-lighter" />
            
            <div className="overflow-hidden">
                <h1 ref={titleLine2Ref} className="text-[12vw] md:text-[8rem] leading-[0.85] font-black tracking-tighter text-primary uppercase drop-shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                LUXMI
                </h1>
            </div>
          </div>
          
            <div ref={descRef} className="mt-8 max-w-xl mx-auto md:mx-0 border-l-4 border-primary/80 pl-6 py-2">
              <h2 className="text-xl md:text-3xl text-white font-anton tracking-wide uppercase mb-3 drop-shadow-lg">
                Premium Hardware Solutions
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 font-bold tracking-[0.2em] uppercase leading-relaxed">
                Screws <span className="text-primary mx-1">•</span> Junction Boxes <span className="text-primary mx-1">•</span> Brass <span className="text-primary mx-1">•</span> Steel
              </p>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full md:w-auto">
              <Button 
                size="lg" 
                variant="glass" 
                onClick={scrollToProducts}
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-none font-bold uppercase tracking-wider group active:scale-95 duration-200"
              >
                Explore Catalog <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="glass" 
                size="lg" 
                onClick={() => setShowMobileQr(true)} 
                className="w-full sm:w-auto md:hidden rounded-none uppercase tracking-wider py-6 active:scale-95 duration-200"
              >
                <QrCode className="mr-2 w-5 h-5" /> Scan QR
              </Button>
            </div>
          </div>

        {/* Desktop QR / Decorative Element */}
        <div ref={qrRef} className="hidden md:flex flex-col items-center justify-center relative group">
          {/* Vite-Style Organic QR Glow - Persistent & Multi-colored */}
          <div className="absolute inset-0 z-0">
            {/* Center/Bottom - Primary Orange */}
            <div ref={qrBlob1Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/40 blur-[80px] rounded-full mix-blend-screen opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Top Left - Silver/White */}
            <div ref={qrBlob2Ref} className="absolute top-0 left-0 w-[100%] h-[100%] bg-white/20 blur-[60px] rounded-full mix-blend-screen opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            
            {/* Bottom Right - Deep Red/Orange */}
            <div ref={qrBlob3Ref} className="absolute bottom-0 right-0 w-[100%] h-[100%] bg-orange-600/30 blur-[60px] rounded-full mix-blend-screen opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
          </div>
          
          <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transform group-hover:scale-105 transition-transform duration-500">
            <div className="bg-white p-4 rounded-xl">
              {currentUrl && (
                <QRCodeSVG value={currentUrl} size={250} level={"H"} />
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-zinc-400 text-sm font-mono uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Scan to Share
            </div>
          </div>
        </div>
      </div>

      {/* Mobile QR View */}
      <div 
        ref={mobileQrRef} 
        className="hidden absolute inset-0 z-20 flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-8 text-center md:hidden overflow-hidden"
      >
         {/* Mobile Animated Blobs - Smaller & More Dynamic */}
         <div className="absolute inset-0 z-0 pointer-events-none">
            <div ref={mobileBlob1Ref} className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-primary/50 blur-[60px] rounded-full mix-blend-screen" />
            <div ref={mobileBlob2Ref} className="absolute top-1/4 left-10 w-[60%] h-[30%] bg-white/30 blur-[50px] rounded-full mix-blend-screen" />
            <div ref={mobileBlob3Ref} className="absolute bottom-1/4 right-10 w-[60%] h-[30%] bg-orange-600/40 blur-[50px] rounded-full mix-blend-screen" />
         </div>

         <div className="relative z-10 bg-white p-4 rounded-xl shadow-2xl mb-8 ring-4 ring-primary/20">
            {currentUrl && (
                <QRCodeSVG value={currentUrl} size={220} level={"H"} />
            )}
        </div>
        <h3 className="relative z-10 text-2xl font-bold text-white mb-2 uppercase tracking-tight drop-shadow-md">Scan to Share</h3>
        <p className="relative z-10 text-zinc-300 mb-8 drop-shadow-md">Point your camera at the QR code</p>
        <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setShowMobileQr(false)} 
            className="relative z-10 gap-2 rounded-full bg-black/80 border-white/20 text-white hover:bg-black shadow-lg backdrop-blur-md"
        >
            <X className="w-5 h-5" />
            Close Scanner
        </Button>
      </div>
    </section>
  );
}
