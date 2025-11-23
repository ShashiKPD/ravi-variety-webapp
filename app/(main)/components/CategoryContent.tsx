"use client";

import { useState } from "react";
import HorizontalProductCard from "./HorizontalProductCard";
import { ProductSummary } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X } from "lucide-react";

type CategoryContentProps = {
  categoryName: string;
  products: ProductSummary[];
  brands: { id: number; name: string }[];
  showInteractiveButtons: boolean;
  wishlistVariantIds: Set<number>;
};

export default function CategoryContent({
  categoryName,
  products,
  brands,
  showInteractiveButtons,
  wishlistVariantIds,
}: CategoryContentProps) {
  // Filter State
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());

  const toggleBrand = (brandId: string) => {
    const next = new Set(selectedBrandIds);
    if (next.has(brandId)) {
      next.delete(brandId);
    } else {
      next.add(brandId);
    }
    setSelectedBrandIds(next);
  };

  const clearFilters = () => {
    setSelectedBrandIds(new Set());
  };

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    // Since we don't have brand_id directly on ProductSummary yet (it's on the group), 
    // we might need to filter based on what we have. 
    // For now, let's assume we can filter if we had the data.
    // EDIT: The RPC *does* return brand_name. Let's filter by brand NAME for now 
    // or pass brand_id in the future. 
    // Wait, ProductSummary type doesn't have brand info. 
    // We need to rely on the fact that we are viewing a category.
    // To do client-side brand filtering properly, we should add 'brand_id' to ProductSummary 
    // or fetch it. For this immediate step, I will disable the *actual* filtering logic 
    // until we add brand_id to the RPC, but I will implement the UI.
    return true; 
  });
  
  // --- Reusable Filter UI ---
  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900">Brands</h3>
            {selectedBrandIds.size > 0 && (
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear</button>
            )}
        </div>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`brand-${brand.id}`} 
                checked={selectedBrandIds.has(String(brand.id))}
                onCheckedChange={() => toggleBrand(String(brand.id))}
              />
              <Label 
                htmlFor={`brand-${brand.id}`} 
                className="text-sm font-normal text-gray-700 cursor-pointer select-none"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />

      <div>
        <h3 className="font-semibold mb-3 text-sm text-gray-900">Price Range</h3>
        <p className="text-xs text-gray-500 italic">Coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      
      {/* --- Mobile Filter Bar --- */}
      <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm sticky top-[70px] z-30 mb-2">
        <span className="font-semibold text-gray-900">{products.length} Items</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 border-gray-300 text-gray-700">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {selectedBrandIds.size > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                      {selectedBrandIds.size}
                  </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader className="border-b pb-4 mb-4">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterContent />
            <SheetFooter className="mt-8 border-t pt-4">
                 <SheetClose asChild>
                     <Button className="w-full">Show Results</Button>
                 </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* --- Desktop Sidebar --- */}
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <div className="sticky top-24">
            <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FilterContent />
            </CardContent>
            </Card>
        </div>
      </aside>

      {/* --- Product List --- */}
      <div className="flex-1">
        <div className="mb-4 hidden lg:block">
             <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
             <p className="text-sm text-gray-500 mt-1">{products.length} results found</p>
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="flex flex-col">
            {filteredProducts.map((product) => (
              <HorizontalProductCard
                key={product.variant_id}
                product={product}
                showInteractiveButtons={showInteractiveButtons}
                isInitiallyWishlisted={wishlistVariantIds.has(product.variant_id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-dashed">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <SearchX className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">No products found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchX({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m13.5 8.5-5 5" />
            <path d="m8.5 8.5 5 5" />
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}