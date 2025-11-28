import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="bg-white min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery Skeleton */}
          <div className="lg:sticky lg:top-24">
             <Skeleton className="aspect-square w-full rounded-lg" />
             <div className="flex gap-2 mt-4">
               {[1, 2, 3, 4].map((i) => (
                 <Skeleton key={i} className="w-20 h-20 rounded-md" />
               ))}
             </div>
          </div>
          
          {/* Right Column: Info Skeleton */}
          <div className="space-y-6">
             {/* Title & SKU */}
             <div>
               <Skeleton className="h-8 w-3/4 mb-2" />
               <Skeleton className="h-4 w-1/4" />
             </div>
             
             <div className="h-px bg-gray-200" />

             {/* Price */}
             <div className="space-y-2">
               <Skeleton className="h-10 w-1/3" />
               <Skeleton className="h-4 w-1/2" />
             </div>

             {/* Variant Selectors */}
             <div className="space-y-3">
               <Skeleton className="h-4 w-20" />
               <div className="flex gap-2">
                 {[1, 2, 3].map((i) => (
                   <Skeleton key={i} className="h-10 w-16 rounded-md" />
                 ))}
               </div>
             </div>

             {/* Add to Cart Bar */}
             <div className="pt-6 border-t flex gap-4">
               <Skeleton className="h-11 w-24" />
               <Skeleton className="h-11 flex-1" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}