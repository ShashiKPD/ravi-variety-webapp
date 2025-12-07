import Link from "next/link";
import ProductCard from "./ProductCard"; 
import { ProductSummary } from "@/lib/types";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  products: ProductSummary[];
  viewAllLink?: string;
  userRole: string;
  wishlistIds: Set<number>;
};

export default function ProductRail({ title, products, viewAllLink, userRole, wishlistIds }: Props) {
  if (products.length === 0) return null;

  const showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);

  return (
    <section className="bg-white py-4 md:py-6 border-b border-gray-100">
      {/* Header */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-blue-600 p-1 flex items-center gap-1 hover:underline">
            <span className="text-sm font-medium hidden md:inline">View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Scroll Container */}
      {/* Fixes:
          1. gap-[2px] matches the ProductGrid layout.
          2. px-4 adds padding to the container itself, pushing the first item away from the edge.
          3. scroll-pl-4 ensures snap alignment respects that padding.
      */}
      <div className="flex overflow-x-auto scrollbar-hide px-4 pb-4 gap-[2px] snap-x snap-mandatory scroll-pl-4">
        {products.map((product) => (
          <div 
            key={product.variant_id} 
            // UPDATED: 160px on mobile -> 220px on desktop
            className="min-w-[160px] max-w-[160px] md:min-w-[220px] md:max-w-[220px] snap-start shrink-0"
          >
            <ProductCard
              product={product}
              showInteractiveButtons={showInteractiveButtons}
              isInitiallyWishlisted={wishlistIds.has(product.variant_id)}
            />
          </div>
        ))}
        
        {/* "See All" Card at the end */}
        {viewAllLink && (
          <div className="min-w-[120px] md:min-w-[160px] flex items-center justify-center snap-start shrink-0">
            <Link href={viewAllLink} className="flex flex-col items-center gap-2 text-blue-600 p-4 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-sm md:text-base font-medium">View All</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}