"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import ProductCard from "./product/ProductCard";
import { ProductData } from "@/lib/types";
import { getMoreProducts } from "@/app/actions/products";
import { Loader2 } from "lucide-react";

type Props = {
  title: string; // <--- Added Title Prop
  initialProducts: ProductData[];
  wishlistIds: Set<number>;
  isLoggedIn: boolean;
};

export default function ProductInfiniteGrid({ 
  title, 
  initialProducts, 
  wishlistIds, 
  isLoggedIn 
}: Props) {
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      // Fetching plain data (no role needed as per updated action)
      const newProducts = await getMoreProducts(page);
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  return (
    <section className="bg-white py-4 md:py-6 border-t border-gray-100">
      {/* Title Section (Matches ProductRail) */}
      <div className="px-4 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 px-4">
        {products.map((product, index) => (
          <div key={`${product.id}-${index}`} className="min-w-0">
            <ProductCard
              product={product}
              isLoggedIn={isLoggedIn}
              isWishlisted={wishlistIds.has(product.id)}
            />
          </div>
        ))}
      </div>

      {/* Loading Trigger */}
      {hasMore && (
        <div ref={ref} className="flex justify-center p-8 w-full mt-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-50" />
        </div>
      )}
      
      {!hasMore && products.length > 0 && (
        <div className="text-center p-8 text-gray-400 text-xs uppercase tracking-widest mt-2">
          — You've reached the end —
        </div>
      )}
    </section>
  );
}