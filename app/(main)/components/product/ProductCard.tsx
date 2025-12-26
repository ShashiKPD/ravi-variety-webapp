import Link from "next/link";
import Image from "next/image"; 
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "../WishlistButton"; 
import PriceDisplay from "./PriceDisplay"; 
import { ProductData } from "@/lib/types";

type Props = {
  product: ProductData;
  isLoggedIn: boolean;
  isWishlisted?: boolean;
  priceTextSize?: "xs" | "sm" | "md" | "lg";
};

export default function ProductCard({ product, isLoggedIn, isWishlisted = false, priceTextSize = "md" }: Props) {
  let variantLabel = product.variant_name;
  if (product.pack_size > 1) {
    if (product.variant_name) {
      variantLabel = `${product.pack_size} x ${product.variant_name}`;
    } else {
      variantLabel = `Pack of ${product.pack_size}`;
    }
  }

  // Calculate if we should show the % OFF badge on image
  const showDiscountBadge = isLoggedIn && product.savings_percentage > 0;

  return (
    <div className="group flex flex-col bg-white overflow-hidden hover:shadow-md transition-all duration-300 h-full relative">
      
      {/* 1. Image Area - Changed background to bg-slate-50 */}
      <Link href={`/p/${product.slug}/${product.id}`} className="relative rounded-lg aspect-square bg-slate-100 block overflow-hidden">
        
        {/* Compact Green Badge */}
        {showDiscountBadge && (
          <div className="absolute top-0 left-0 z-10 bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md shadow-sm">
            {product.savings_percentage}% OFF
          </div>
        )}

        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name} 
            fill 
            className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-medium">No Image</div>
        )}
        
        <div className={`${priceTextSize === "xs" ? "top-1 right-1" : "top-2 right-2"} z-10 absolute`}>
          <WishlistButton 
            className={`${priceTextSize === "xs" ? "h-5 w-5" : "h-7 w-7"} shadow-sm bg-white/80 hover:bg-white`}
            productId={product.id} 
            initialState={isWishlisted}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </Link>

      {/* 2. Content Area */}
      <div className="relative flex flex-col pt-1">
        
        {/* Floating Add Button */}
        {isLoggedIn && product.final_price !== null && (
          <div className="absolute -top-4 right-1 z-20">
            <AddToCartButton 
              productId={product.id} 
              inStock={product.in_stock}
              packSize={product.pack_size}
              name={product.name}
              imageUrl={product.image_url}
              price={product.final_price}
              size={priceTextSize === "xs" ? "sm" : "md"}
              className={`${priceTextSize === "xs" ? "h-6 sm:h-8 px-2 sm:px-4" : "h-8"} w-auto min-w-[70px] text-xs bg-white hover:bg-blue-50 border-blue-100 shadow-md rounded-xl text-blue-700 font-bold`}
            />
          </div>
        )}

        {/* Variant Info - Removed pr-[80px] */}
        <div className="min-h-[18px] mb-1.5"> 
          {variantLabel && (
            <span className="inline-flex items-center px-1.5 py-0.3 rounded text-[10px] font-semibold bg-slate-100 text-gray-700 border border-slate-200 whitespace-nowrap truncate max-w-full">
              {variantLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/p/${product.slug}/${product.id}`} className="block mb-1">
          <h3 className="text-xs sm:text-sm md:text-base  font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div>
          {isLoggedIn && product.final_price !== null && (
            <PriceDisplay 
              finalPrice={product.final_price}
              originalPrice={product.original_price}
              mrp={product.mrp}
              priceSource={product.price_source}
              discountLabel={product.discount_label} 
              savingsPercentage={product.savings_percentage}
              unit={product.unit_name}
              size={priceTextSize}
            />
          )}
        </div>

      </div>
    </div>
  );
}