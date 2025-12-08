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
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-blue-600 p-1 flex items-center gap-1 hover:underline">
            <span className="text-sm font-medium hidden md:inline">View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Responsive Layout:
        Mobile: Flex + overflow-x-auto (Rail)
        Desktop (md): Grid + grid-cols-5 (Grid)
      */}
      <div className="
        flex overflow-x-auto scrollbar-hide px-4 pb-4 gap-2 snap-x snap-mandatory scroll-pl-4
        md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:overflow-visible md:gap-4 md:px-4 md:pb-0
      ">
        {products.map((product) => (
          <div 
            key={product.variant_id} 
            className="
              min-w-[160px] max-w-[160px] snap-start shrink-0
              md:min-w-0 md:max-w-none md:w-auto
            "
          >
            <ProductCard
              product={product}
              showInteractiveButtons={showInteractiveButtons}
              isInitiallyWishlisted={wishlistIds.has(product.variant_id)}
            />
          </div>
        ))}
        
        {/* 'See All' Card - Hidden in Desktop Grid view usually, or kept as last item */}
        {viewAllLink && (
          <div className="
            min-w-[120px] flex items-center justify-center snap-start shrink-0
            md:hidden
          ">
            <Link href={viewAllLink} className="flex flex-col items-center gap-2 text-blue-600 p-4 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">View All</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}