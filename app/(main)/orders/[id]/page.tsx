import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, ShoppingBag, Clock } from "lucide-react";
import CancelOrderButton from "../../components/CancelOrderButton";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [orderRes, itemsRes] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id)
  ]);

  if (orderRes.error || !orderRes.data) notFound();
  
  const order = orderRes.data;
  const items = itemsRes.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
      case "approved": return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
      case "delivered": return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const orderDate = new Date(order.created_at);
  const now = new Date();
  const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
  const isCancellable = order.status === 'pending' && diffInHours < 1;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 font-sans bg-gray-50 min-h-screen sm:bg-white">
      
      {/* --- Top Nav (Mobile: Compact, Desktop: Standard) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button variant="ghost" asChild className="pl-0 gap-2 w-fit -ml-2 sm:ml-0 text-gray-600">
          <Link href="/orders"><ArrowLeft className="w-5 h-5" /> Back to Orders</Link>
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          {isCancellable && <div className="flex-1 sm:flex-none"><CancelOrderButton orderId={order.id} /></div>}
          <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none bg-white">
            <Printer className="w-4 h-4" /> <span className="sm:inline">Print</span>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm sm:border sm:shadow-sm overflow-hidden">
        
        {/* --- Header Section (Redesigned for Mobile) --- */}
        <div className="bg-white p-5 sm:bg-gray-50/50 sm:border-b sm:p-6">
          <div className="flex flex-col gap-4">
            
            {/* Row 1: ID & Status */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Order #{order.id}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {orderDate.toLocaleString()}
                </div>
              </div>
              <Badge className={`px-3 py-1 text-xs font-semibold capitalize border ${getStatusColor(order.status)} shadow-none rounded-full`}>
                {order.status}
              </Badge>
            </div>

            {/* Row 2: Total Amount Box (Mobile Highlight) */}
            <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-4 flex justify-between items-center sm:hidden">
               <span className="text-sm font-medium text-gray-600">Grand Total</span>
               <span className="text-2xl font-bold text-gray-900">₹{order.total_amount}</span>
            </div>

            {/* Desktop Total (Hidden on Mobile) */}
            <div className="hidden sm:block text-right absolute top-6 right-6">
               <p className="text-sm text-gray-500">Total Amount</p>
               <p className="text-2xl font-bold text-gray-900">₹{order.total_amount}</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-0 bg-white">
          
          {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
          <div className="hidden sm:block min-w-full">
            <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-4">
              <div className="col-span-5">Item Name</div>
              <div className="col-span-2 text-center">Type</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 text-sm items-center hover:bg-gray-50/50">
                  <div className="col-span-5 font-medium text-gray-900 truncate" title={item.product_name}>
                    {item.product_name}
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {item.variant_name || "Standard"}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-right text-gray-600">₹{item.unit_price}</div>
                  <div className="col-span-1 text-center text-gray-900 font-medium">{item.quantity}</div>
                  <div className="col-span-2 text-right font-bold text-gray-900">₹{item.total_price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* --- MOBILE CARD VIEW (Visible only on Mobile) --- */}
          <div className="sm:hidden divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex flex-col gap-2 bg-white">
                
                {/* Row 1: Name */}
                <div className="font-medium text-gray-900 text-base leading-snug">
                  {item.product_name}
                </div>

                {/* Row 2: Details & Price */}
                <div className="flex justify-between items-end mt-1">
                  <div className="flex flex-col gap-1.5">
                    {/* Type Badge */}
                    <div>
                      <Badge variant="outline" className="text-xs font-normal text-gray-600 bg-gray-50 border-gray-200 rounded-sm px-1.5 py-0">
                        {item.variant_name || "Standard"}
                      </Badge>
                    </div>
                    {/* Calculation */}
                    <div className="text-xs text-gray-500 font-medium">
                      {item.quantity} x ₹{item.unit_price}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-lg font-bold text-gray-900">
                    ₹{item.total_price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- Footer Summary --- */}
          <div className="p-6 pt-2 bg-gray-50/30 sm:bg-white">
            <div className="hidden sm:block">
               <Separator className="my-4" />
            </div>
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.total_amount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>--</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}