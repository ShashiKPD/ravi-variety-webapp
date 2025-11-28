import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      <Skeleton className="h-8 w-48 mb-6" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}