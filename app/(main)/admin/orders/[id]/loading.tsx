import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminOrderDetailsLoading() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-32" />
        <div className="flex items-center gap-2">
           <Skeleton className="h-4 w-24" />
           <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
          
          {/* Action Box */}
          <Card className="h-24 flex items-center px-6">
             <Skeleton className="h-10 w-full" />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="h-48">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
          <Card className="h-48">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}