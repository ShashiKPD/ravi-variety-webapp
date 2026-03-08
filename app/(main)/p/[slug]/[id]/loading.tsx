import MobileProductHeader from "@/app/(main)/components/product/MobileProductHeader";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollToTopOnMount from "@/app/(main)/components/ScrollToTopOnMount";
  
export default function ProductLoading() {
  return (
    <div className="bg-white sm:bg-gray-50 min-h-screen pb-0 sm:pb-20 font-sans">
      <ScrollToTopOnMount />
      <MobileProductHeader title="" /> 
      
      {/* Breadcrumbs (Desktop Only) */}
      <div className="bg-white border-b px-4 py-3 mb-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Skeleton className="h-3 w-10" />
          <div className="h-3 w-3 rounded-full bg-gray-200" />
          <Skeleton className="h-3 w-16" />
          <div className="h-3 w-3 rounded-full bg-gray-200" />
          <Skeleton className="h-3 w-24" />
          <div className="h-3 w-3 rounded-full bg-gray-200" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        
        {/* Product Card Wrapper */}
        <div className="bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:divide-x divide-gray-100">
            
            {/* Left: Gallery Skeleton */}
            <div className="md:col-span-6 lg:col-span-5 p-0 sm:p-6 lg:p-8">
              <div className="md:sticky md:top-24">
                {/* Main Image - Edge to edge on mobile */}
                <Skeleton className="aspect-5/4 md:aspect-square w-full rounded-none sm:rounded-lg" />
                
                {/* Thumbnails (Desktop) */}
                <div className="hidden sm:flex gap-2 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-md" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Info Skeleton */}
            <div className="md:col-span-6 lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col h-full">
              
              {/* 1. Header */}
              <div className="mb-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="w-full">
                    {/* Brand */}
                    <Skeleton className="h-3 w-20 mb-2" />
                    {/* Title (2 lines) */}
                    <Skeleton className="h-6 sm:h-8 w-3/4 mb-2" />
                    <Skeleton className="h-6 sm:h-8 w-1/2" />
                  </div>
                  {/* Stock Badge placeholder */}
                  <Skeleton className="h-6 w-16 rounded-full shrink-0" />
                </div>
                
                {/* Meta Pills */}
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>

              {/* 2. Pricing & Bulk Section (Gray Box) */}
              <div className="bg-gray-50/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-y border-gray-100 mb-6 space-y-4">
                {/* Price Row */}
                <div className="flex items-baseline gap-3">
                  <Skeleton className="h-8 w-32" /> {/* Active Price */}
                  <Skeleton className="h-6 w-20" /> {/* Base Price */}
                  <Skeleton className="h-4 w-12" /> {/* MRP */}
                </div>
                
                {/* Total Line */}
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                   <Skeleton className="h-3 w-40" />
                   <Skeleton className="h-3 w-16" />
                </div>

                {/* Bulk Tiers Grid */}
                <div className="mt-2 grid grid-cols-3 gap-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 border-r border-gray-100 p-2 flex flex-col justify-center items-center gap-1">
                      <Skeleton className="h-2 w-10" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Description Toggle */}
              <div className="mb-6">
                <Skeleton className="h-4 w-32" />
              </div>

              {/* 4. Selectors */}
              <div className="space-y-6">
                
                {/* Pack Size */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>

                {/* Cousin Varieties (Image Grid) */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <Skeleton className="aspect-square rounded-md" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Desktop Action Bar (Static) */}
              <div className="mt-8 hidden lg:flex gap-4 items-center">
                <Skeleton className="h-12 w-32 rounded-lg" /> {/* Stepper */}
                <Skeleton className="h-12 flex-1 rounded-lg" /> {/* Add Button */}
                <Skeleton className="h-12 w-12 rounded-lg" /> {/* Wishlist */}
              </div>

              {/* 6. Mobile Action Bar (Fixed Bottom) */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 pb-safe z-50 flex gap-3">
                <Skeleton className="h-11 w-32 rounded-lg" />
                <Skeleton className="h-11 flex-1 rounded-lg" />
                <Skeleton className="h-11 w-11 rounded-lg" />
              </div>

              {/* 7. Trust Footer */}
              <div className="mt-8 pt-4 border-t flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}