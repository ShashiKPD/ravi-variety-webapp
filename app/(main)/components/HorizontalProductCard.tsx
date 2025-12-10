"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./product/AddToCartButton";
import { ProductSummary } from "@/lib/types";

export default function HorizontalProductCard({
  product,
  showInteractiveButtons = false,
  isInitiallyWishlisted = false,
}: {
  product: ProductSummary;
  showInteractiveButtons?: boolean;
  isInitiallyWishlisted?: boolean;
}) {
  let priceDisplay = null;

  if (product.price_data) {
    const { unit_price, sale_price, mrp } = product.price_data;
    const activePrice = sale_price && sale_price > 0 ? sale_price : unit_price;
    const margin = mrp && mrp > activePrice 
      ? Math.round(((mrp - activePrice) / mrp) * 100) 
      : 0;

    priceDisplay = (
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">₹{activePrice}</span>
          {mrp && mrp > activePrice && (
            <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
          )}
        </div>
        {margin > 0 && (
           <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
             {margin}% Margin
           </span>
        )}
      </div>
    );
  }

  return (
    <Card className="flex flex-row p-3 gap-3 border border-gray-100 shadow-sm rounded-lg hover:shadow-md transition-shadow relative overflow-hidden bg-white">
        
      {/* 1. Image Section (Left) */}
      <div className="relative w-24 h-24 shrink-0 bg-gray-50 rounded-md border border-gray-100">
         <Link href={`/p/${product.product_slug}/${product.variant_id}`} className="block w-full h-full">
            <Image
              src={product.thumbnail_url || "/placeholder.png"}
              alt={product.product_name}
              fill
              className="object-contain p-2 mix-blend-multiply"
              sizes="96px"
            />
         </Link>
         {/* Wishlist on top of image for density */}
         {showInteractiveButtons && (
            <div className="absolute top-1 right-1">
               <WishlistButton 
                 productId={product.variant_id} 
                 isInitiallyWishlisted={isInitiallyWishlisted} 
                 className="h-6 w-6 bg-white/80 backdrop-blur-sm shadow-sm border-none [&_svg]:h-3.5 [&_svg]:w-3.5"
               />
            </div>
         )}
      </div>

      {/* 2. Details Section (Right) */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
         
         <div className="space-y-1">
            <Link href={`/p/${product.product_slug}/${product.variant_id}`}>
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                {product.product_name}
              </h3>
            </Link>
            
            {/* Variant Label */}
            <p className="text-xs text-gray-500 font-medium bg-gray-100 w-fit px-1.5 rounded">
               {product.variant_name}
            </p>
         </div>

         <div className="flex items-end justify-between gap-2 mt-2">
            {/* Price */}
            <div>{priceDisplay}</div>

            {/* Action Button (Compact) */}
            {showInteractiveButtons && (
               <div className="w-24"> 
                  <AddToCartButton 
                    productId={product.variant_id} 
                    className="h-8 text-xs px-2 shadow-none border-blue-600 text-blue-600 hover:bg-blue-50"
                  />
               </div>
            )}
         </div>
      </div>

    </Card>
  );
}