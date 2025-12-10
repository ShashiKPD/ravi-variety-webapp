import Link from "next/link";
import Image from "next/image";
import { PackageOpen, Lock } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "../WishlistButton"; // <--- Import
import PriceDisplay from "./PriceDisplay"; 
import { ProductData } from "@/lib/types";

type Props = {
  product: ProductData;
  isLoggedIn: boolean;
  isWishlisted?: boolean; // <--- New Prop
};

export default function ProductCard({ product, isLoggedIn, isWishlisted = false }: Props) {

  const perPiecePrice = (isLoggedIn && product.pack_size > 1 && product.final_price)
    ? (product.final_price / product.pack_size).toFixed(2) 
    : null;

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
            className="h-7 w-7"
            productId={product.id} 
            isInitiallyWishlisted={isWishlisted}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </Link>

      {/* 2. Content Area */}
      <div className="p-2 sm:p-3 gap-2 sm:gap-2.5 flex-1 flex flex-col">
        
        {/* Title */}
        <Link href={`/p/${product.slug}/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pack Info */}
        {product.pack_size > 1 && (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 leading-none">
              <PackageOpen className="w-3 h-3 hidden sm:block" /> Pack of {product.pack_size}
            </span>
            {perPiecePrice && (
              <span className="text-[10px] text-blue-600 font-medium">
                (₹{perPiecePrice}/pc)
              </span>
            )}
          </div>
        )}

        {/* ACCESS CONTROL */}
        {isLoggedIn && product.final_price !== null ? (
          <div className="mt-auto flex flex-col gap-2">
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

            <AddToCartButton 
              productId={product.id} 
              inStock={product.in_stock}
              packSize={product.pack_size}
              className="h-8 text-xs" 
            />
          </div>
        ) : (
          /* GUEST VIEW */
          <div className="mt-auto pt-2">
            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 p-1.5 rounded border border-gray-100 mb-2">
              <Lock className="w-3 h-3 shrink-0" />
              <span className="text-[9px] font-medium leading-tight">
                Price Locked
              </span>
            </div>
            
            <Link 
              href="/login"
              className="flex items-center justify-center w-full h-8 text-xs font-bold bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}