"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Check, Tag, Percent } from "lucide-react";

type Props = {
  isAnonymous: boolean;
  activePrice: number;
  basePrice: number;
  mrp: number;
  qty: number;
  setQty: (q: number) => void;
  pricingTiers: any[];
  priceSource: 'sale' | 'bulk' | 'standard';
  saleLabel?: string | null;
  salePrice?: number | null;
  cartQty: number;
  unitName: string;
};

export default function PricingSection({
  isAnonymous,
  activePrice,
  basePrice,
  mrp,
  qty,
  setQty,
  pricingTiers,
  priceSource,
  saleLabel,
  salePrice,
  cartQty,
  unitName
}: Props) {
  
  if (isAnonymous) {
    return (<></>
      // <div className="bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-y border-gray-100 mb-5">
      //   <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
      //     <div>
      //       <p className="font-bold text-gray-900 text-sm">Wholesale Pricing</p>
      //       <p className="text-[10px] text-gray-500">Login to view prices</p>
      //     </div>
      //     <Button asChild variant="outline" size="sm" className="h-8 text-xs">
      //       <Link href="/login">Login Now</Link>
      //     </Button>
      //   </div>
      // </div>
    );
  }

  // Visual Logic
  const isDiscounted = activePrice < basePrice;
  const showMrp = mrp > 0;
  
  // Calculate Savings % (Base Price vs Active Price)
  const savingsPercent = basePrice > activePrice 
    ? Math.round(((basePrice - activePrice) / basePrice) * 100) 
    : 0;

  const showSaleBadge = priceSource === 'sale';

  return (
    <div className="bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 border-y border-gray-100">
      <div>
        
        {/* A. PRICE HEADER */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
              ₹{activePrice}
            </span>
            <span className="text-gray-500 text-xs font-medium">/ {unitName}</span>

            {/* Crossed Out Base Price (If Discounted) */}
            {isDiscounted && (
              <span className="text-xl sm:text-2xl text-gray-400 line-through font-medium decoration-gray-300 ml-1">
                ₹{basePrice}
              </span>
            )}

            {/* MRP (If Exists) */}
            {showMrp && (
              <span className="text-xs text-gray-400 ml-1">
                MRP: ₹{mrp}
              </span>
            )}
            {/* 1. SAVINGS BADGE (% OFF) */}
            {savingsPercent > 0 && (
              <Badge className="ml-1 bg-green-600 hover:bg-green-700 text-white border-0 text-[10px] px-1.5 h-5 gap-1">
                {savingsPercent}% OFF
              </Badge>
            )}
            {/* 2. SALE BADGE (Explicit Sale) */}
            {showSaleBadge && (
              <Badge className="ml-1 bg-red-600 hover:bg-red-700 text-white border-0 text-[10px] px-1.5 h-5 gap-1">
                <Tag className="w-3 h-3" /> {saleLabel || "Sale"}
              </Badge>
            )}
          </div>
        </div>
        
        {/* B. TOTAL PRICE LINE (Only if Bulk Tiers exist) */}
        {pricingTiers.length > 1 && (
          <div className="w-full text-[10px] sm:text-xs text-gray-500 font-medium mt-1 flex justify-between items-center border-t border-gray-200 pt-2">
             <span className="flex items-center gap-1">
               Total: <span className="font-bold text-gray-900 text-sm">₹{(activePrice * qty).toLocaleString()}</span> 
               <span className="text-gray-400">({qty} {qty === 1 ? 'unit' : 'units'})</span>
             </span>
             
             {cartQty > 0 && cartQty === qty && (
               <span className="text-blue-600 font-bold flex items-center gap-1">
                 <Check className="w-3 h-3" /> In Cart
               </span>
             )}
          </div>
        )}

        {/* C. BULK TIERS TABLE (Smart Override) */}
        {pricingTiers.length > 1 && (
          <div className="mt-2 overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm ring-1 ring-black/5">
            <div className="bg-blue-50/50 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-blue-800 uppercase tracking-wide border-b border-blue-100 flex justify-between items-center">
              <span>Buy More, Save More</span>
              <span className="text-[9px] sm:text-[10px] text-blue-600 font-normal normal-case">Tap to apply</span>
            </div>
            <div className="flex divide-x divide-gray-100">
              {pricingTiers.map((tier: any, index: number) => {
                const nextTier = pricingTiers[index + 1];
                const isActive = qty >= tier.min_quantity && (!nextTier || qty < nextTier.min_quantity);
                
                const tierPrice = Math.round(tier.unit_price);
                const effectiveSalePrice = salePrice ? Math.round(salePrice) : Infinity;
                
                const isOverriddenBySale = effectiveSalePrice < tierPrice;
                const displayPrice = isOverriddenBySale ? effectiveSalePrice : tierPrice;

                return (
                  <button
                    key={tier.min_quantity} 
                    type="button"
                    onClick={() => setQty(tier.min_quantity)}
                    className={cn(
                      "flex-1 p-2 text-center transition-all duration-200 focus:outline-none relative group flex flex-col items-center justify-center min-h-[50px]",
                      isActive ? "bg-blue-600 text-white shadow-inner" : "hover:bg-blue-50 bg-white text-gray-900"
                    )}
                  >
                    <div className={cn("text-[10px] mb-0.5 font-medium", isActive ? "text-blue-100" : "text-gray-500")}>
                      Qty {tier.min_quantity}+
                    </div>
                    
                    <div className="text-xs sm:text-sm font-bold tracking-tight flex flex-col leading-none">
                      {isOverriddenBySale ? (
                        <>
                          <span className={cn("text-[9px] line-through font-normal opacity-70", isActive ? "text-blue-200" : "text-gray-400")}>
                            ₹{tierPrice}
                          </span>
                          <span>₹{displayPrice}</span>
                        </>
                      ) : (
                        <span>₹{displayPrice}</span>
                      )}
                    </div>

                    {isOverriddenBySale && isActive && (
                      <span className="text-[8px] bg-red-500 text-white px-1 rounded mt-1">Sale</span>
                    )}

                    {isActive && !isOverriddenBySale && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}