import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { ProductSummary } from "@/lib/types";

type ProductGridProps = {
  products: ProductSummary[];
  totalCount: number;
  currentPage: number;
  limit?: number;
  showInteractiveButtons: boolean;
  wishlistVariantIds: Set<number>;
  // We need these to build the pagination links correctly
  currentParams: { [key: string]: string | string[] | undefined };
  clearFiltersHref: string;
};

export default function ProductGrid({
  products,
  totalCount,
  currentPage,
  limit = 20,
  showInteractiveButtons,
  wishlistVariantIds,
  currentParams,
  clearFiltersHref
}: ProductGridProps) {
  
  const totalPages = Math.ceil(Number(totalCount) / limit);

  // 1. Empty State
  if (products.length === 0) {
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

  // 2. The Grid
  return (
    <div className="flex flex-col gap-12">
      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {products.map((product) => (
          <ProductCard
            key={product.variant_id}
            product={product}
            showInteractiveButtons={showInteractiveButtons}
            isInitiallyWishlisted={wishlistVariantIds.has(product.variant_id)}
          />
        ))}
      </div>

      {/* 3. Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage <= 1}
            asChild={currentPage > 1}
          >
            {currentPage > 1 ? (
              <Link href={{ query: { ...currentParams, page: currentPage - 1 } }}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Link>
            ) : (
              <span><ChevronLeft className="h-4 w-4 mr-2" /> Previous</span>
            )}
          </Button>
          
          <span className="text-sm text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages}
            asChild={currentPage < totalPages}
          >
            {currentPage < totalPages ? (
              <Link href={{ query: { ...currentParams, page: currentPage + 1 } }}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            ) : (
              <span>Next <ChevronRight className="h-4 w-4 ml-2" /></span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}