"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";
import { ProductSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProductCard({
  product,
  showInteractiveButtons = false,
  isInitiallyWishlisted = false,
}: {
  product: ProductSummary;
  showInteractiveButtons?: boolean;
  isInitiallyWishlisted?: boolean;
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { unit_price, sale_price, mrp } = product.price_data || {};
  const activePrice = sale_price && sale_price > 0 ? sale_price : unit_price || 0;
  const hasOffer = mrp && mrp > activePrice;
  const discountPercentage = hasOffer ? Math.round(((mrp - activePrice) / mrp) * 100) : 0;

  return (
    <Card className="group flex flex-col h-full gap-1 py-2 bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden relative hover:shadow-md transition-all">
      
      <div className="relative w-full pt-[100%] bg-gray-50">
        <Link href={`/p/${product.product_slug}/${product.variant_id}`} className="absolute inset-0 p-2 md:p-4">
          <Image
            src={product.thumbnail_url || "/placeholder.png"}
            alt={product.product_name}
            fill
            className={cn(
              "object-contain duration-500 ease-in-out group-hover:scale-105",
              isImageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onLoad={() => setIsImageLoaded(true)}
          />
        </Link>

        {showInteractiveButtons && (
          <div className="absolute top-1 right-1 z-10">
            <WishlistButton 
              productId={product.variant_id} 
              isInitiallyWishlisted={isInitiallyWishlisted} 
              // Increased icon size slightly for desktop
              className="h-6 w-6 md:h-8 md:w-8 bg-white/90 backdrop-blur-sm shadow-sm border-gray-100 [&_svg]:h-3.5 [&_svg]:w-3.5 md:[&_svg]:h-4 md:[&_svg]:w-4 text-gray-400 hover:text-red-500"
            />
          </div>
        )}

        {hasOffer && discountPercentage > 0 && (
          <div className="absolute top-1 left-1 z-10 bg-green-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-2 md:p-3 space-y-1.5">
        
        <div className="flex-1 space-y-0.5 md:space-y-1">
          <Link href={`/p/${product.product_slug}/${product.variant_id}`} className="block">
            {/* UPDATED: Text size scales up on md screens */}
            <h3 className="text-xs md:text-sm font-medium text-gray-900 leading-tight md:leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.product_name}
            </h3>
          </Link>
          {/* UPDATED: Variant text scales up */}
          <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
            {product.variant_name || "Standard"}
          </p>
        </div>

        <div className="mt-auto pt-1 flex flex-col gap-2 md:gap-3">
          
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-1.5">
              {/* UPDATED: Price size scales up */}
              <span className="text-sm md:text-base font-bold text-gray-900">₹{activePrice}</span>
              {hasOffer && (
                <span className="text-[10px] md:text-xs text-gray-400 line-through decoration-gray-300">
                  ₹{mrp}
                </span>
              )}
            </div>
          </div>

          {showInteractiveButtons && activePrice > 0 && (
            <div className="w-full">
              {/* UPDATED: Button height and text size scale up */}
              <AddToCartButton 
                productId={product.variant_id} 
                className="w-full h-7 md:h-9 text-[10px] md:text-xs" 
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}