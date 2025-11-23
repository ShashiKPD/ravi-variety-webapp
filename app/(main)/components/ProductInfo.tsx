"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import { ProductPrice, PricingTier } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  currentVariant: any;
  sizeVariants: any[];
  otherTypes: any[];
  priceData: ProductPrice | null;
  pricingTiers: PricingTier[];
  isWishlisted: boolean;
  userRole: string;
};

export default function ProductInfo({
  currentVariant,
  sizeVariants,
  otherTypes,
  priceData,
  pricingTiers,
  isWishlisted,
  userRole,
}: Props) {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeUnitTestPrice, setActiveUnitTestPrice] = useState<number>(0);

  const currentMrp = priceData && priceData.mrp ? priceData.mrp : 0;

  useEffect(() => {
    if (!priceData) return;
    let finalPrice = priceData.sale_price || priceData.unit_price;

    if (pricingTiers && pricingTiers.length > 0) {
      const applicableTier = [...pricingTiers]
        .sort((a, b) => b.min_quantity - a.min_quantity)
        .find((t) => quantity >= t.min_quantity);

      if (applicableTier) {
        finalPrice = applicableTier.unit_price;
      }
    }
    setActiveUnitTestPrice(finalPrice);
  }, [quantity, priceData, pricingTiers]);

  const processedTiers = useMemo(() => {
    if (!pricingTiers || pricingTiers.length === 0) return [];
    
    return pricingTiers.map((tier, index) => {
      const nextTier = pricingTiers[index + 1];
      const rangeLabel = nextTier 
        ? `${tier.min_quantity}-${nextTier.min_quantity - 1}`
        : `${tier.min_quantity}+`;

      const tierMrp = tier.mrp || 0;
      const margin = tierMrp > 0
        ? Math.round(((tierMrp - tier.unit_price) / tierMrp) * 100) 
        : 0;

      return { ...tier, rangeLabel, margin };
    });
  }, [pricingTiers]);

  return (
    <div className="flex flex-col h-full font-sans pb-32 lg:pb-0">
      
      {/* HEADER */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {currentVariant.name}
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">SKU: {currentVariant.sku}</span>
          {currentVariant.stock_quantity > 0 ? (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* PRICE DISPLAY */}
      <div className="mb-6">
        {userRole !== "anon" && priceData ? (
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-bold text-gray-900">₹{activeUnitTestPrice}</span>
              {currentMrp > activeUnitTestPrice && (
                 <span className="text-lg text-gray-400 line-through">₹{currentMrp}</span>
              )}
            </div>
            <p className="text-sm text-gray-500">Price per unit (incl. taxes)</p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
            <p className="text-gray-600 font-medium mb-3">Login to see wholesale pricing</p>
            <Button asChild className="w-full sm:w-auto"><Link href="/login">Login to View Prices</Link></Button>
          </div>
        )}
      </div>

      {/* 1. SIZE VARIANTS */}
      {sizeVariants.length > 1 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Select Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((variant: any) => {
               const isActive = variant.id === currentVariant.id;
               return (
                 <Link key={variant.id} href={`/p/${variant.slug}/${variant.id}`} scroll={false}>
                    <div className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg border transition-all",
                        isActive 
                          ? "bg-black text-white border-black shadow-md" 
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                      )}>
                      {variant.options?.size || variant.name}
                    </div>
                 </Link>
               );
            })}
          </div>
        </div>
      )}

      {/* 2. OTHER VARIETIES (COUSINS) - Updated Layout */}
      {otherTypes && otherTypes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Similar Products</h3>
          {/* Horizontal Scroll Container */}
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar scroll-smooth">
            {otherTypes.map((type: any) => (
              <Link 
                key={type.product_id} 
                href={`/p/${type.slug}/${type.default_variant_id}`}
                className="shrink-0 group"
              >
                 <div className="w-24 flex flex-col gap-2">
                   {/* Thumbnail Card */}
                   <div className="w-24 h-24 rounded-lg border bg-white p-1 relative overflow-hidden group-hover:border-blue-500 group-hover:shadow-md transition-all">
                     <img 
                        src={type.thumbnail_url || "/placeholder.png"} 
                        alt={type.name} 
                        className="w-full h-full object-contain mix-blend-multiply"
                     />
                   </div>
                   {/* Group Name */}
                   <span className="text-xs text-center font-medium text-gray-600 leading-tight line-clamp-2 group-hover:text-blue-600">
                      {/* Strip Brand Name if redundant, optional */}
                      {type.name}
                   </span>
                 </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ACTION BAR (Mobile Fixed, Desktop Static) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 lg:static lg:border-none lg:shadow-none lg:p-0 lg:mb-8">
        <div className="flex gap-4 max-w-7xl mx-auto lg:mx-0">
           <div className="w-24 shrink-0">
             <Input 
               type="number" 
               min={1} 
               value={quantity} 
               onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
               className="text-center h-11 font-medium text-lg"
             />
           </div>
           <div className="flex-1 min-w-0">
              <AddToCartButton 
                productId={currentVariant.id} 
                quantity={quantity}
                className="h-11 text-base font-medium w-full"
              />
           </div>
           <div className="flex-none">
              <WishlistButton productId={currentVariant.id} isInitiallyWishlisted={isWishlisted} />
           </div>
        </div>
      </div>

      {/* 3. BUY IN BULK TABLE (After Cart Buttons) */}
      {userRole !== "anon" && processedTiers.length > 1 && (
        <div className="mb-8 mt-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-base">Buy In Bulk</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-2 text-sm text-gray-400 font-medium">
            <div>Quantity</div>
            <div>Price</div>
            <div>Margin</div>
          </div>

          <div className="space-y-3">
            {processedTiers.map((tier) => {
              const isActive = quantity >= tier.min_quantity && 
                (!pricingTiers.find(t => t.min_quantity > tier.min_quantity) || 
                  quantity < pricingTiers.find(t => t.min_quantity > tier.min_quantity)!.min_quantity);

              return (
                <div 
                  key={tier.min_quantity} 
                  className={cn(
                    "grid grid-cols-3 gap-4 text-sm py-1 transition-colors duration-200",
                    isActive ? "font-bold text-blue-700" : "font-medium text-gray-700"
                  )}
                >
                  <div>{tier.rangeLabel}</div>
                  <div>₹{tier.unit_price}</div>
                  <div className={cn(isActive ? "text-blue-700" : "text-gray-900")}>
                    {tier.margin}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DESCRIPTION */}
      <div className="pt-6 border-t">
         <h3 className="text-lg font-bold mb-3">About this item</h3>
         <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
           {currentVariant.description}
         </p>
      </div>

    </div>
  );
}