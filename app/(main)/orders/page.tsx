import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Calendar, ShoppingBag } from "lucide-react";
import Image from "next/image";

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-blue-50 text-blue-700 border-blue-200";
    case "delivered": return "bg-green-50 text-green-700 border-green-200";
    case "rejected": return "bg-red-50 text-red-700 border-red-200";
    case "cancelled": return "bg-gray-50 text-gray-700 border-gray-200";
    case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="bg-gray-50 p-6 rounded-full mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Please login</h2>
      <p className="text-gray-500 mb-4">You need to be logged in to view your orders.</p>
      <Button asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    </div>
  );

  // Fetch Orders with nested Items and Product Images
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        product_name,
        products (
          image_urls
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Your Orders</h1>
        <span className="text-sm text-gray-500 font-medium">
          {orders?.length || 0} {orders?.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <div className="space-y-6">
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            // Logic to grab thumbnails
            // We take the first 4 distinct images to show as a preview
            const previewItems = order.order_items.slice(0, 4);
            const remainingCount = Math.max(0, order.order_items.length - 4);
            
            return (
              <div 
                key={order.id} 
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                {/* Header: ID, Date, Status */}
                <div className="bg-gray-50/50 px-4 py-3 sm:px-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {order.order_number || `ORD-#${order.id}`}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { 
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>

                {/* Body: Images and Total */}
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  
                  {/* Image Stack */}
                  <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                    {previewItems.length > 0 ? (
                      <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300 pl-1">
                        {previewItems.map((item: any, idx: number) => {
                          // Fallback image if product was deleted or has no image
                          const imgUrl = item.products?.image_urls?.[0] || null;
                          
                          return (
                            <div 
                              key={item.id} 
                              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 border-white shadow-sm bg-gray-100 shrink-0 overflow-hidden"
                              style={{ zIndex: 10 - idx }}
                            >
                              {imgUrl ? (
                                <Image 
                                  src={imgUrl} 
                                  alt={item.product_name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <ShoppingBag className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {remainingCount > 0 && (
                          <div 
                            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center z-0"
                          >
                            <span className="text-xs font-bold text-gray-500">+{remainingCount}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <ShoppingBag className="w-5 h-5" />
                        <span>No items info</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 sm:pl-6 sm:border-l sm:border-gray-100">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Amount</span>
                      <span className="text-lg font-bold text-gray-900">₹{order.total_amount.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <Button asChild size="sm" variant="default" className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6">
                      <Link href={`/orders/${order.id}`} className="flex items-center gap-2">
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              Looks like you haven't placed any orders yet. Start shopping to fill this page!
            </p>
            <Button asChild className="rounded-full px-8">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}