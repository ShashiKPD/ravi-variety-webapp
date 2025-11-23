import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";
import { ProductSummary } from "@/lib/types"; // Updated import

export default function ProductCard({
  product,
  showInteractiveButtons = false,
  isInitiallyWishlisted = false,
}: {
  product: ProductSummary; // Updated Type
  showInteractiveButtons?: boolean;
  isInitiallyWishlisted?: boolean;
}) {
  // --- Price Logic ---
  let priceDisplay = <p className="text-sm text-gray-500">Log in to see price</p>;

  if (product.price_data) {
    const { unit_price, sale_price, mrp } = product.price_data;
    const activePrice = sale_price && sale_price > 0 ? sale_price : unit_price;

    priceDisplay = (
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">₹{activePrice.toFixed(2)}</span>
          {mrp && mrp > activePrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{mrp.toFixed(2)}
            </span>
          )}
        </div>
        {sale_price && sale_price > 0 && (
          <span className="text-xs text-green-600 font-medium">On Sale</span>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow gap-0 py-0">
        {showInteractiveButtons && (
          <WishlistButton
            productId={product.variant_id}
            isInitiallyWishlisted={isInitiallyWishlisted}
          />
        )}
      <div className="relative w-full aspect-square bg-white">
        <Link href={`/p/${product.product_slug}/${product.variant_id}`}>
          <Image
            src={product.thumbnail_url || "/placeholder.png"}
            alt={product.product_name}
            fill
            style={{ objectFit: "contain", padding: "12px" }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </Link>
      </div>

      <CardHeader className="p-3 pb-0">
         <Link href={`/p/${product.product_slug}/${product.variant_id}`}>
            <CardTitle className="truncate text-sm sm:text-base hover:underline text-wrap">
            {product.product_name}
            </CardTitle>
        </Link>
        <CardDescription className="truncate text-xs mt-1">
          {product.variant_name}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 pt-2 mt-auto">
        <div className="mb-3">{priceDisplay}</div>
        {showInteractiveButtons && (
          <AddToCartButton productId={product.variant_id} />
        )}
      </CardContent>
    </Card>
  );
}