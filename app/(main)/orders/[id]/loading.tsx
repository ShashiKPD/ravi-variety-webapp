import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailsLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 font-sans bg-gray-50 min-h-screen sm:bg-white">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <Card className="border-none shadow-sm sm:border sm:shadow-sm overflow-hidden">
        {/* Order Header */}
        <div className="bg-white p-5 sm:bg-gray-50/50 sm:border-b sm:p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        
        <CardContent className="p-0 bg-white">
          {/* Items List */}
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between sm:w-1/3 items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 pt-2 bg-gray-50/30 sm:bg-white">
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}