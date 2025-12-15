"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, Truck, ArrowRight, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductPageActions from "./product/ProductPageActions";
import PricingSection from "./product/PricingSection";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext"; 

type Props = {
  currentVariant: any & { in_stock: boolean }; 
  sizeVariants: any[];
  cousinProducts: any[];
  priceData: any;
  pricingTiers: any[];
  isWishlisted: boolean;
  userRole: string;
};

export default function ProductInfo({
  currentVariant,
  sizeVariants,
  cousinProducts,
  priceData,
  pricingTiers,
  isWishlisted,
  userRole,
}: Props) {
  const { items } = useCart(); 
  const isAnonymous = userRole === "anon";

  const cartItem = items.find(i => i.id === currentVariant.id);
  const cartQty = cartItem ? cartItem.qty : 0;

  const [qty, setQty] = useState(1);
  const [isDescOpen, setIsDescOpen] = useState(false); 

  useEffect(() => {
    setQty(cartQty > 0 ? cartQty : 1);
    setIsDescOpen(false); 
  }, [currentVariant.id, cartQty]);

  // --- BEST DEAL ALGORITHM ---
  const { activePrice, priceSource, salePrice } = useMemo(() => {
    if (!priceData) return { activePrice: 0, priceSource: 'standard' as const, salePrice: null };
    
    const hasSale = priceData.price_source === 'sale';
    const effectiveSalePrice = hasSale ? priceData.final_price : Infinity;

    let bulkPrice = priceData.original_price;
    if (pricingTiers && pricingTiers.length > 0) {
      const tier = [...pricingTiers].reverse().find(t => qty >= t.min_quantity);
      if (tier) {
        bulkPrice = tier.unit_price;
      }
    }

    let final = bulkPrice;
    let source: 'sale' | 'bulk' | 'standard' = 'standard';

    if (hasSale && effectiveSalePrice < bulkPrice) {
      final = effectiveSalePrice;
      source = 'sale';
    } else if (bulkPrice < priceData.original_price) {
      final = bulkPrice;
      source = 'bulk';
    }

    return { 
      activePrice: Math.round(final), 
      priceSource: source,
      salePrice: hasSale ? effectiveSalePrice : null 
    };
  }, [qty, priceData, pricingTiers]);

  const basePrice = Math.round(priceData?.original_price || 0); 
  const mrp = Math.round(priceData?.mrp || 0);

  const pack = currentVariant.pack_size || 1;
  const size = currentVariant.options?.size;
  let variantLabel = null;
  if (pack > 1) {
    variantLabel = size ? `${pack} x ${size}` : `Pack of ${pack}`;
  } else if (size) {
    variantLabel = size;
  }

  return (
    <div className="flex flex-col h-full font-sans">
      
      {/* 1. HEADER */}
      <div className="mb-2 sm:mb-5">
        <div className="flex justify-between items-start gap-2">
          <div>
            <Link 
              href={`/search?brands=${currentVariant.brand_slug}`}
              className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline mb-1 inline-block"
            >
              {currentVariant.brand_name}
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
              {currentVariant.name}
            </h1>
          </div>
          {!currentVariant.in_stock && (
            <Badge variant="destructive" className="shrink-0 h-6 text-[10px] uppercase tracking-wide">
              Out of Stock
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {variantLabel && (
            <div className="flex items-center px-2 py-0.5 rounded bg-gray-900 text-white text-[10px] sm:text-xs font-bold shadow-sm">
              {variantLabel}
            </div>
          )}
          <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-[10px] sm:text-xs">
            <span className="font-mono text-gray-500">{currentVariant.sku}</span>
          </div> 
          <span className="text-gray-300">|</span> 
          {currentVariant.in_stock ? (
            <span className="text-green-700 font-medium flex items-center gap-1.5 text-[10px] sm:text-xs bg-green-50 px-2 py-1 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              In Stock
            </span>
          ) : (
            <span className="text-red-600 font-medium flex items-center gap-1 text-[10px] sm:text-xs">
              <AlertCircle className="w-3 h-3" /> Unavailable
            </span>
          )}
        </div>
      </div>

      {/* 2. PRICING SECTION */}
      <PricingSection 
        isAnonymous={isAnonymous}
        activePrice={activePrice}
        basePrice={basePrice}
        mrp={mrp}
        qty={qty}
        setQty={setQty}
        pricingTiers={pricingTiers}
        priceSource={priceSource}
        saleLabel={priceData?.discount_label}
        salePrice={salePrice}
        cartQty={cartQty}
        unitName={currentVariant.unit_short_name || 'Unit'}
      />

      {/* 3. DETAILS TOGGLE */}
      <div className="px-1 mt-2 sm:mt-4 mb-6 sm:mb-8">
        <button 
          onClick={() => setIsDescOpen(!isDescOpen)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          View Product Details
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isDescOpen ? "rotate-180" : "group-hover:translate-y-0.5")} />
        </button>
        {isDescOpen && (
          <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-200 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {currentVariant.description || "No detailed description available."}
            </p>
            <button onClick={() => setIsDescOpen(false)} className="flex items-center gap-1 mt-3 text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors ml-auto">
              Show Less <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 4. SELECTORS */}
      <div className="space-y-5 flex-1">
        
        {/* A. Pack Size */}
        {sizeVariants.length > 1 && (
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">Pack Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizeVariants.map((v: any) => {
                const isActive = v.id === currentVariant.id;
                const label = v.size || (v.pack_size > 1 ? `Pack of ${v.pack_size}` : "Standard");
                
                return (
                  <Link 
                    key={v.id} 
                    href={`/p/${v.slug}/${v.id}`}
                    scroll={false} 
                    className={cn(
                      "px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border transition-all relative overflow-hidden",
                      isActive 
                        ? "border-black bg-black text-white shadow-md" 
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {label}
                    {isActive && <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white transform translate-x-0.5 translate-y-0.5 rotate-45" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* B. Available Varieties */}
        {cousinProducts && cousinProducts.length > 0 && (
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">Available Varieties</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-5">
              
              {/* Current Product */}
              <div className="flex flex-col gap-1 w-full relative">
                <div className="aspect-square rounded-md border-2 border-blue-600 bg-white p-1 relative shadow-sm">
                  <Image src={currentVariant.image_urls?.[0] || "/placeholder.png"} alt={currentVariant.name} fill className="object-contain p-1" />
                  <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center"><Check className="w-5 h-5 text-blue-600 drop-shadow-sm" /></div>
                </div>
                <div className="text-center px-1">
                   <p className="text-[10px] font-bold text-blue-700 leading-tight line-clamp-2 mb-0.5">
                     {currentVariant.name}
                   </p>
                   <p className="text-[9px] text-gray-500 font-medium truncate">
                     {variantLabel || "Standard"}
                   </p>
                </div>
              </div>

              {/* Cousins */}
              {cousinProducts.map((p: any) => {
                const cLabel = p.size 
                  ? (p.pack_size > 1 ? `${p.pack_size}x${p.size}` : p.size) 
                  : (p.pack_size > 1 ? `Pack of ${p.pack_size}` : null);

                return (
                  <Link 
                    key={p.product_id} 
                    href={`/p/${p.slug}/${p.product_id}`}
                    className="flex flex-col gap-1 w-full group relative"
                    title={p.name}
                  >
                    <div className="relative aspect-square rounded-md border border-gray-200 bg-white p-1 group-hover:border-blue-400 group-hover:shadow-md transition-all">
                      <Image 
                        src={p.image_url || "/placeholder.png"} 
                        alt={p.name} 
                        fill 
                        className="object-contain p-1 mix-blend-multiply group-hover:scale-105 transition-transform" 
                      />
                      {p.size_matched && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full ring-1 ring-white" />
                      )}
                    </div>
                    
                    <div className="text-center px-0.5">
                      <p className="text-[10px] text-gray-700 font-medium leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors mb-0.5">
                        {p.name}
                      </p>
                      
                      <div className="text-[9px] text-gray-500 leading-none">
                        {cLabel && <span className="block mb-0.5 font-semibold text-gray-400">{cLabel}</span>}
                        
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <span className="font-bold text-gray-900">₹{Math.round(p.price || 0)}</span>
                          {p.mrp > p.price && (
                            <span className="line-through text-gray-300 decoration-gray-300">
                              ₹{Math.round(p.mrp)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. ACTION BAR */}
      {!isAnonymous && (
        <div className="lg:mb-4">
          <ProductPageActions 
            productId={currentVariant.id}
            stock={currentVariant.in_stock ? 999 : 0} 
            name={currentVariant.name}
            imageUrl={currentVariant.image_urls?.[0]}
            price={activePrice}
            packSize={currentVariant.pack_size || 1}
            isWishlisted={isWishlisted}
            isLoggedIn={!isAnonymous}
            qty={qty} 
            onQtyChange={setQty}
            cartQty={cartQty}
          />
        </div>
      )}

      {/* 6. TRUST & BRAND */}
      <div className=" border-t border-gray-100">
        <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6 text-[10px] sm:text-xs text-gray-500">
          <div className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-600" /> Fast Delivery</div>
          <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Genuine Product</div>
        </div>
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-3 text-white flex items-center justify-between shadow-md">
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-widest">More from</p>
            <p className="text-sm sm:text-base font-bold truncate">{currentVariant.brand_name}</p>
          </div>
          <Button asChild variant="secondary" size="sm" className="text-gray-900 font-bold hover:bg-gray-100 h-8 text-xs shrink-0">
            <Link href={`/search?brands=${currentVariant.brand_slug}`}>
              Explore <ArrowRight className="w-3 h-3 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

    </div>
  );
}