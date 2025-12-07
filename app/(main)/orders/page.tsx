import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Package } from "lucide-react";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-8 text-center text-gray-500">Please login to view orders.</div>;

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Status Badge Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-blue-100 text-blue-700 border-blue-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Orders</h1>

      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer border shadow-sm">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                    <Badge variant="outline" className={`capitalize border px-2 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
            <Package className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">No orders found.</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}