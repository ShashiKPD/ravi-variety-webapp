import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersListLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3 flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}