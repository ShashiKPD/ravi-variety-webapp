import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OrderActions from "../../components/orders/OrderActions";

export default async function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Order (Removed 'email')
  const { data: order } = await supabase
    .from("orders")
    .select(`*, profiles(full_name, role)`) 
    .eq("id", id)
    .single();

  if (!order) notFound();

  // 2. Fetch Items
  const { data: items } = await supabase
    .from("order_items")
    .select(`*, products ( stock_quantity, sku )`)
    .eq("order_id", id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="pl-0 gap-2">
          <Link href="/admin/orders"><ArrowLeft className="w-4 h-4" /> Back to List</Link>
        </Button>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-500">Order Status:</span>
           <Badge className={`capitalize ${getStatusColor(order.status)}`}>{order.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Req Qty</TableHead>
                    <TableHead className="text-center">Live Stock</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items && items.map((item: any) => {
                    const currentStock = item.products?.stock_quantity || 0;
                    const isShortage = order.status === 'pending' && currentStock < item.quantity;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{item.product_name}</div>
                          <div className="text-xs text-gray-500">{item.variant_name}</div>
                          <div className="text-xs text-gray-400 font-mono">{item.products?.sku}</div>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {item.quantity}
                          <span className="text-xs text-gray-500 font-normal">{item.unit_name}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={isShortage ? "text-red-600 font-bold" : "text-gray-600"}>
                            {currentStock}
                          </span>
                          {isShortage && <div className="text-[10px] text-red-500 font-bold">Low Stock!</div>}
                        </TableCell>
                        <TableCell className="text-right">₹{item.total_price}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="p-4 flex justify-end border-t bg-gray-50">
                <div className="flex gap-8 text-sm">
                   <span>Total Items: {items?.length}</span>
                   <span className="font-bold text-lg">Total: ₹{order.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.status === 'pending' && (
            <Card className="border-blue-100 bg-blue-50/30">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">Review Required</p>
                  <p>Approving this order will immediately deduct inventory.</p>
                </div>
                <OrderActions orderId={order.id} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="text-gray-500 text-xs">Name</p>
                <p className="font-medium">{profile?.full_name || "Unknown"}</p>
              </div>
              {/* REMOVED EMAIL DISPLAY TO FIX BUG */}
              <div>
                <p className="text-gray-500 text-xs">Role</p>
                <Badge variant="secondary" className="mt-1 capitalize">{profile?.role}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="text-gray-500 text-xs">Order ID</p>
                <p className="font-mono">#{order.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Placed On</p>
                <p>{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Last Updated</p>
                <p>{new Date(order.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}