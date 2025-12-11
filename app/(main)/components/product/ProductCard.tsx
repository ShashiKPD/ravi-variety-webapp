import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "../WishlistButton"; 
import PriceDisplay from "./PriceDisplay"; 
import { ProductData } from "@/lib/types";

type Props = {
  product: ProductData;
  isLoggedIn: boolean;
  isWishlisted?: boolean;
};

export default function ProductCard({ product, isLoggedIn, isWishlisted = false }: Props) {

  // Logic: "12 x 115 ml" or "Pack of 12"
  let variantLabel = product.variant_name;
  
  if (product.pack_size > 1) {
    if (product.variant_name) {
      variantLabel = `${product.pack_size} x ${product.variant_name}`;
    } else {
      variantLabel = `Pack of ${product.pack_size}`;
    }
  }

  return (
    <div className="group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 h-full relative">
      
      {/* 1. Image Area */}
      <Link href={`/p/${product.slug}/${product.id}`} className="relative aspect-square bg-white p-2 block overflow-hidden">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name} 
            fill 
            className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 text-[10px] font-medium">No Image</div>
        )}
        
        {/* Wishlist Button (Top Right) */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton 
            className="h-7 w-7 shadow-sm bg-white/80 hover:bg-white"
            productId={product.id} 
            initialState={isWishlisted}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </Link>

      {/* 2. Content Area */}
      <div className="relative p-2.5 flex flex-col pt-3">
        
        {/* FLOATING ACTION BUTTON (Overlaps Image) */}
        {isLoggedIn && product.final_price !== null && (
          <div className="absolute -top-4 right-1 z-20">
            <AddToCartButton 
              productId={product.id} 
              inStock={product.in_stock}
              packSize={product.pack_size}
              name={product.name}
              imageUrl={product.image_url}
              price={product.final_price}
              className="h-8 w-auto min-w-[70px] text-xs bg-white hover:bg-blue-50 border-blue-100 shadow-md rounded-xl text-blue-700 font-bold" 
            />
          </div>
        )}

        {/* A. Variant Info (Left side, avoiding the button) */}
        <div className="min-h-[18px] mb-1.5 pr-[80px]"> 
          {variantLabel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap truncate max-w-full">
              {variantLabel}
            </span>
          )}
        </div>

        {/* B. Title */}
        <Link href={`/p/${product.slug}/${product.id}`} className="block mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* C. Pricing (Sits directly under title) */}
        <div>
          {isLoggedIn && product.final_price !== null ? (
            <PriceDisplay 
              finalPrice={product.final_price}
              originalPrice={product.original_price}
              mrp={product.mrp}
              priceSource={product.price_source}
              discountLabel={product.discount_label}
              savingsPercentage={product.savings_percentage}
              unit={product.unit_name}
              size="sm" 
            />
          ) : (
            /* GUEST VIEW */
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1 text-gray-400">
                <Lock className="w-3 h-3" />
                <span className="text-[10px] font-medium">Locked</span>
              </div>
              <Link href="/login" className="text-[10px] font-bold text-blue-600 hover:underline">
                Login
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}