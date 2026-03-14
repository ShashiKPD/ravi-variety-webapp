// app/(main)/components/ProductGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ProductCard from "@/app/(main)/components/product/ProductCard";
import { ProductData } from "@/lib/types";
import { fetchProductsAction } from "@/app/(main)/actions/products";

type ProductGridProps = {
  products: ProductData[];
  totalCount: number;
  currentPage: number;
  limit?: number;
  isLoggedIn: boolean;
  wishlistVariantIds: Set<number>;
  currentParams: { [key: string]: string | string[] | undefined };
  clearFiltersHref: string;
  supercategorySlug?: string | null; // Pass this explicitly
};

export default function ProductGrid({
  products,
  totalCount,
  currentPage,
  limit = 20,
  isLoggedIn,
  wishlistVariantIds,
  currentParams,
  clearFiltersHref,
  supercategorySlug = null
}: ProductGridProps) {
  
  const [items, setItems] = useState<ProductData[]>(products);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(totalCount > products.length);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  // Reset state when filters/URL change
  useEffect(() => {
    setItems(products);
    setPage(2);
    setHasMore(totalCount > products.length);
  }, [products, totalCount, currentParams, supercategorySlug]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const newProducts = await fetchProductsAction(
        currentParams,
        supercategorySlug,
        page,
        limit
      );
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
        if (items.length + newProducts.length >= totalCount) {
          setHasMore(false);
        }
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

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p className="text-lg font-medium text-gray-900">No products found</p>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters.</p>
        <Button variant="link" asChild className="mt-4">
          <Link href={clearFiltersHref}>Clear all filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
        {items.map((product, index) => (
          <ProductCard
            key={`${product.id}-${index}`}
            product={product}
            isLoggedIn={isLoggedIn}
            isWishlisted={wishlistVariantIds.has(product.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center p-8 w-full mt-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-50" />
        </div>
      )}

      {!hasMore && items.length > 0 && totalCount > limit && (
        <div className="text-center p-8 text-gray-400 text-xs uppercase tracking-widest mt-2">
          — You've reached the end —
        </div>
      )}
    </div>
  );
}