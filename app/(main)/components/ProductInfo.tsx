"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductPageActions from "./product/ProductPageActions";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Props = {
  currentVariant: any;
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
  // 1. Single Source of Truth for Quantity
  const [qty, setQty] = useState(1);
  const isAnonymous = userRole === "anon";

  useEffect(() => {
    setQty(1);
  }, [currentVariant.id]);

  // 2. Active Price Logic
  const activePrice = useMemo(() => {
    if (!priceData) return 0;
    let final = priceData.final_price; 

    if (pricingTiers && pricingTiers.length > 0) {
      const tier = [...pricingTiers].reverse().find(t => qty >= t.min_quantity);
      if (tier && tier.unit_price < final) {
         final = tier.unit_price;
      }
    }
    return final;
  }, [qty, priceData, pricingTiers]);

  const basePrice = priceData?.original_price || 0; 
  const mrp = priceData?.mrp || 0;
  const isDiscounted = activePrice < basePrice;

  return (
    <div className="flex flex-col h-full font-sans pb-24 lg:pb-0">
      
      {/* 1. Header */}
      <div className="mb-6">
        <Link href={`/search?brands=${currentVariant.brand_slug}`} className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline mb-2 inline-block">
          {currentVariant.brand_name}
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
          {currentVariant.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border">
            <span className="font-mono text-xs">SKU: {currentVariant.sku}</span>
          </div>
          <span className="text-gray-300">|</span>
          {currentVariant.stock_quantity > 0 ? (
            <span className="text-green-700 font-medium flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              In Stock 
              {/* ({currentVariant.stock_quantity}) */}
            </span>
          ) : <Badge variant="destructive">Out of Stock</Badge>}
        </div>
      </div>

      {/* 2. Pricing & Bulk Table */}
      <div className="bg-gray-50/50 -mx-6 px-6 py-6 border-y border-gray-100 mb-8">
        {isAnonymous ? (
          <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
            <div>
              <p className="font-bold text-gray-900">Wholesale Pricing</p>
              <p className="text-xs text-gray-500">Login to view prices</p>
            </div>
            <Button asChild variant="outline" size="sm"><Link href="/login">Login Now</Link></Button>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-3 mb-2 flex-wrap">
              <span className="text-4xl font-extrabold text-gray-900 tracking-tight">₹{activePrice}</span>
              {isDiscounted && <span className="text-xl text-gray-400 line-through font-medium mb-1 decoration-gray-300">₹{basePrice}</span>}
              {mrp > basePrice && <span className="text-sm text-gray-400 font-medium mb-2 ml-1">(MRP: <span className="line-through">₹{mrp}</span>)</span>}
              {isDiscounted && (
                <div className="mb-2"><Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">{Math.round(((basePrice - activePrice) / basePrice) * 100)}% Saved</Badge></div>
              )}
            </div>
            <div className="w-full text-xs text-gray-500 font-medium mt-1">
               Price for <strong>{qty}</strong> {qty === 1 ? 'unit' : 'units'} (incl. taxes)
            </div>

            {/* Bulk Selector */}
            {pricingTiers.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm ring-1 ring-black/5">
                <div className="bg-blue-50/50 px-4 py-2 text-xs font-bold text-blue-800 uppercase tracking-wide border-b border-blue-100 flex justify-between items-center">
                  <span>Buy More, Save More</span>
                  <span className="text-[10px] text-blue-600 font-normal normal-case">Select quantity below</span>
                </div>
                <div className="flex divide-x divide-gray-100">
                  {pricingTiers.map((tier: any, index: number) => {
                    const nextTier = pricingTiers[index + 1];
                    const isActive = qty >= tier.min_quantity && (!nextTier || qty < nextTier.min_quantity);
                    return (
                      <button
                        key={tier.min_quantity} 
                        type="button"
                        onClick={() => setQty(tier.min_quantity)} // UPDATES PARENT STATE
                        className={cn("flex-1 p-3 text-center transition-all duration-200 focus:outline-none relative", isActive ? "bg-blue-600 text-white shadow-inner" : "hover:bg-blue-50 bg-white text-gray-900")}
                      >
                        <div className={cn("text-xs mb-1 font-medium", isActive ? "text-blue-100" : "text-gray-500")}>Qty {tier.min_quantity}+</div>
                        <div className="text-sm font-bold tracking-tight">₹{tier.unit_price}</div>
                        {isActive && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Variants & Cousins */}
      <div className="space-y-6 flex-1">
        {sizeVariants.length > 1 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">Pack Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizeVariants.map((v: any) => (
                <Link key={v.id} href={`/p/${v.slug}/${v.id}`} scroll={false} className={cn("px-4 py-2 text-sm font-medium rounded-md border transition-all relative overflow-hidden", v.id === currentVariant.id ? "border-black bg-black text-white shadow-md" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300")}>
                  {v.size || v.pack_size}
                  {v.id === currentVariant.id && <div className="absolute bottom-0 right-0 w-2 h-2 bg-white transform translate-x-1 translate-y-1 rotate-45" />}
                </Link>
              ))}
            </div>
          </div>
        )}

        {cousinProducts && cousinProducts.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Available Varieties</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              <div className="aspect-square rounded-lg border-2 border-blue-600 bg-white p-1 relative shadow-sm">
                <Image src={currentVariant.image_urls?.[0] || "/placeholder.png"} alt={currentVariant.name} fill className="object-contain p-1" />
                <div className="absolute inset-0 bg-blue-600/5 flex items-center justify-center"><Check className="w-5 h-5 text-blue-600 drop-shadow-sm" /></div>
              </div>
              {cousinProducts.map((p: any) => (
                <Link key={p.product_id} href={`/p/${p.slug}/${p.product_id}`} className="group relative aspect-square rounded-lg border border-gray-200 bg-white p-1 hover:border-blue-400 hover:shadow-md transition-all block">
                  <Image src={p.image_url || "/placeholder.png"} alt={p.name} fill className="object-contain p-1 mix-blend-multiply group-hover:scale-105 transition-transform" />
                  {p.size_matched && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Bar (Single Source of Truth) */}
      {!isAnonymous && (
        <div className="mt-8">
          <ProductPageActions 
            productId={currentVariant.id}
            stock={currentVariant.stock_quantity}
            name={currentVariant.name}
            imageUrl={currentVariant.image_urls?.[0]}
            price={activePrice}
            packSize={currentVariant.pack_size || 1}
            isWishlisted={isWishlisted}
            isLoggedIn={!isAnonymous}
            qty={qty} // Passing state down
            onQtyChange={setQty} // Passing setter down
          />
        </div>
      )}

      {/* 5. Trust & Brand Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex gap-6 mb-8 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-600" /> Fast Delivery</div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600" /> Genuine Product</div>
        </div>
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white flex items-center justify-between shadow-lg">
          <div><p className="text-xs text-gray-400 font-medium uppercase tracking-widest">More from</p><p className="text-lg font-bold">{currentVariant.brand_name}</p></div>
          <Button asChild variant="secondary" className="text-gray-900 font-bold hover:bg-gray-100">
            <Link href={`/search?brands=${currentVariant.brand_slug}`}>Explore Range <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}