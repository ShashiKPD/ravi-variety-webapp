"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/context/CartContext";
import { ChevronRight, ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";
import { bulkSyncCart } from "@/app/(main)/cart/actions";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FloatingCartBar() {
  const { items, cartCount } = useCart();
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // --- 1. VISIBILITY LOGIC (ALLOWLIST) ---
  // Only show on these specific customer-facing pages
  const isVisibleRoute = 
    pathname === "/" || 
    pathname.startsWith("/p/") || 
    pathname.startsWith("/categories") || 
    pathname.startsWith("/category") || 
    pathname.startsWith("/search");

  // Reset sync state if we navigated away
  useEffect(() => {
    setIsSyncing(false);
  }, [pathname]);

  // --- 2. ANIMATION STATES ---
  const [isMounted, setIsMounted] = useState(false); 
  const [isVisible, setIsVisible] = useState(false); 
  const [isExpanded, setIsExpanded] = useState(false); 
  
  const lastImageRef = useRef<string | null>(null);

  // --- 3. MASTER WATCHER ---
  useEffect(() => {
    // Only mount if we have items AND we are on an allowed page
    if (cartCount > 0 && isVisibleRoute) {
      const lastItem = items[items.length - 1];
      if (lastItem?.image_url) lastImageRef.current = lastItem.image_url;
      if (!isMounted) setIsMounted(true);
    } 
  }, [cartCount, items, isMounted, isVisibleRoute]);

  // --- 4. ANIMATION SEQUENCER ---
  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    // If route is NOT allowed, force immediate unmount (no animation)
    if (!isVisibleRoute) {
      setIsVisible(false);
      setIsExpanded(false);
      setIsMounted(false);
      return;
    }

    if (cartCount > 0 && isMounted) {
      // ENTER
      if (!isVisible) requestAnimationFrame(() => setIsVisible(true));
      if (!isExpanded) t1 = setTimeout(() => setIsExpanded(true), 500);
    } else if (cartCount === 0 && isMounted) {
      // EXIT
      setIsExpanded(false);
      t1 = setTimeout(() => {
        setIsVisible(false);
        t2 = setTimeout(() => setIsMounted(false), 500);
      }, 400); 
    }

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [cartCount, isMounted, isVisible, isExpanded, isVisibleRoute]);

  if (!isMounted || !isVisibleRoute) return null;

  // --- SYNC THEN NAVIGATE ---
  const handleViewCart = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    // 1. Sync DB with Local State
    const syncData = items.map(i => ({ productId: i.id, quantity: i.qty }));
    const res = await bulkSyncCart(syncData);
    
    if (res?.success) {
      // 2. Navigate
      router.push("/cart");
    } else { 
      setIsSyncing(false); 
      if (res?.error === "Please login to checkout") router.push("/login"); 
    }
  };

  const displayItems = items.length > 0 ? items : []; 
  const previewItems = displayItems.slice(-3).reverse();
  const circleImage = items.length > 0 ? items[items.length - 1]?.image_url : lastImageRef.current;

  return (
    <div className={cn(
      "fixed left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300",
      // Mobile: bottom-24 (Clear Nav) | Desktop: bottom-6
      "bottom-20 md:bottom-6"
    )}>
      <button 
        onClick={handleViewCart}
        disabled={isSyncing || !isExpanded} 
        className={cn(
          "pointer-events-auto relative h-12 bg-[#15803d] text-white shadow-xl shadow-green-900/20 overflow-hidden transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isVisible ? "translate-y-0 opacity-100 duration-500" : "translate-y-24 opacity-0 duration-500",
          isExpanded ? "w-auto min-w-[200px] px-2 rounded-full duration-500" : "w-12 rounded-full duration-500",
          isExpanded && "hover:bg-[#166534] active:scale-95"
        )}
      >
        <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300", isExpanded ? "opacity-0 pointer-events-none delay-0" : "opacity-100 delay-100")}>
          {circleImage ? (
            <div className="relative w-9 h-9 rounded-full border-2 border-white bg-white overflow-hidden shadow-sm">
               <img src={circleImage} alt="Added" className="object-cover w-full h-full" />
            </div>
          ) : <ShoppingBag className="w-5 h-5 text-white" />}
        </div>

        <div className={cn("flex items-center w-full gap-3 transition-all duration-300", isExpanded ? "opacity-100 translate-x-0 delay-200" : "opacity-0 -translate-x-4 pointer-events-none")}>
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {previewItems.map((item) => (
                <div key={item.id} className="relative w-9 h-9 rounded-full border-2 border-white bg-white overflow-hidden shadow-sm shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}  className="object-cover w-full h-full" />
                  ) : <div className="w-full h-full bg-gray-100" />}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start min-w-[80px]">
            <span className="font-bold text-sm leading-tight whitespace-nowrap">View cart</span>
            <span className="text-[10px] font-medium text-green-100 leading-tight">{cartCount} items</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0 ml-auto">
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
      </button>
    </div>
  );
}