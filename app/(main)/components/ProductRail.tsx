import Link from "next/link";
import ProductCard from "./product/ProductCard"; 
import { ProductData } from "@/lib/types"; // Correct Type
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  products: ProductData[];
  viewAllLink?: string;
  wishlistIds: Set<number>;
  isLoggedIn: boolean; // <--- Pass this down!
};

export default function ProductRail({ title, products, viewAllLink, wishlistIds, isLoggedIn }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white py-4 md:py-6 border-b border-gray-100">
      
      {/* Header */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-blue-600 p-1 flex items-center gap-1 hover:bg-blue-50 rounded-lg transition-colors group">
            <span className="text-sm font-semibold hidden md:inline group-hover:underline">View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* LAYOUT STRATEGY:
         Mobile: Horizontal Scroll using Grid Auto Flow Column.
         Desktop: Standard Grid Wrap.
      */}
      <div className="
        grid grid-flow-col auto-cols-[160px] gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scroll-pl-4 scrollbar-hide
        md:grid-flow-row md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-6 md:px-6 md:pb-0 md:overflow-visible
      ">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="snap-start h-full"
          >
            <ProductCard
              product={product}
              isLoggedIn={isLoggedIn} // <--- Critical
              isWishlisted={wishlistIds.has(product.id)}
            />
          </div>
        ))}
        
        {/* 'See All' Card - Mobile Only */}
        {viewAllLink && (
          <div className="flex items-center justify-center snap-start md:hidden w-[120px]">
            <Link href={viewAllLink} className="flex flex-col items-center gap-2 text-blue-600 p-4 group w-full h-full justify-center border border-dashed border-blue-200 rounded-xl bg-blue-50/50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-active:scale-95 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide">View All</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}