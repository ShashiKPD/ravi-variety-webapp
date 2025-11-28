import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-5 w-16 ml-auto" />
                <Skeleton className="h-3 w-24 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}