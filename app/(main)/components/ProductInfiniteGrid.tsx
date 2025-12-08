"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import ProductCard from "./ProductCard";
import { ProductSummary } from "@/lib/types";
import { getMoreProducts } from "@/app/actions/products";
import { Loader2 } from "lucide-react";

type Props = {
  initialProducts: ProductSummary[];
  userRole: string;
  wishlistIds: Set<number>;
};

export default function ProductInfiniteGrid({ initialProducts, userRole, wishlistIds }: Props) {
  const [products, setProducts] = useState<ProductSummary[]>(initialProducts);
  const [page, setPage] = useState(2); // Start fetching from page 2
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const newProducts = await getMoreProducts(page, userRole);
      
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

  const showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);

  return (
    <section className="bg-white py-4 md:py-6">
      <div className="px-4 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">All Products</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 px-4">
        {products.map((product, index) => (
          <div key={`${product.variant_id}-${index}`} className="min-w-0">
            <ProductCard
              product={product}
              showInteractiveButtons={showInteractiveButtons}
              isInitiallyWishlisted={wishlistIds.has(product.variant_id)}
            />
          </div>
        ))}
      </div>

      {/* Loading Trigger */}
      {hasMore && (
        <div ref={ref} className="flex justify-center p-8 w-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
      
      {!hasMore && (
        <div className="text-center p-8 text-gray-500 text-sm">
          You've reached the end!
        </div>
      )}
    </section>
  );
}