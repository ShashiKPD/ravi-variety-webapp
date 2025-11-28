import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";
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
  // --- Price Logic ---
  let priceDisplay = <p className="text-xs text-gray-500 italic">Log in to see price</p>;

  if (product.price_data) {
    const { unit_price, sale_price, mrp } = product.price_data;
    const activePrice = sale_price && sale_price > 0 ? sale_price : unit_price;

    priceDisplay = (
      <div className="flex flex-col items-end">
        <div className="flex items-baseline gap-1.5">
          {mrp && mrp > activePrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{mrp.toFixed(2)}
            </span>
          )}
          <span className="text-base sm:text-lg font-bold text-gray-900">₹{activePrice.toFixed(2)}</span>
        </div>
        {sale_price && sale_price > 0 && (
          <span className="text-[10px] sm:text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
            On Sale
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full overflow-hidden flex flex-row h-32 sm:h-40 mb-3 relative hover:shadow-md transition-shadow border-gray-200">
      {/* Image Section (Left) */}
      <div className="relative w-28 sm:w-40 h-full bg-white shrink-0 border-r border-gray-100">
         <Link href={`/p/${product.product_slug}/${product.variant_id}`} className="block w-full h-full">
            <Image
              src={product.thumbnail_url || "/placeholder.png"}
              alt={product.product_name}
              fill
              style={{ objectFit: "contain", padding: "8px" }}
              sizes="(max-width: 640px) 30vw, 160px"
            />
        </Link>
        
        {showInteractiveButtons && (
          <div className="absolute top-1 left-1">
             <WishlistButton
              productId={product.variant_id}
              isInitiallyWishlisted={isInitiallyWishlisted}
            />
          </div>
        )}
      </div>

      {/* Details Section (Right) */}
      <CardContent className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/p/${product.product_slug}/${product.variant_id}`}>
                <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                {product.product_name}
                </h3>
            </Link>
            <p className="text-xs text-gray-500 mt-1 truncate">{product.variant_name}</p>
            
            {/* Stock indicator (Optional enhancement) */}
            {product.stock_quantity > 0 ? (
               <p className="text-[10px] text-green-600 mt-1 font-medium">In Stock</p>
            ) : (
               <p className="text-[10px] text-red-600 mt-1 font-medium">Out of Stock</p>
            )}
          </div>
          
          {/* Price on the right */}
          <div className="shrink-0">
             {priceDisplay}
          </div>
        </div>

        {/* CTA Button */}
        {showInteractiveButtons && (
          <div className="self-end w-full sm:w-auto mt-auto pt-2">
             <AddToCartButton productId={product.variant_id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}