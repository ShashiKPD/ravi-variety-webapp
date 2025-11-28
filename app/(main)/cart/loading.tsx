import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-10 w-48 mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Item List Skeleton */}
        <div className="lg:col-span-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-0 divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 py-6 px-4 sm:px-6">
                  <Skeleton className="h-24 w-24 rounded-md" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex justify-between items-end">
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Skeleton */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 border-gray-200">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Separator />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-11 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}