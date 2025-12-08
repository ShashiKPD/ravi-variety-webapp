import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, ShoppingBag, MapPin, Phone, Mail } from "lucide-react";
import CancelOrderButton from "../../components/CancelOrderButton";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // 'id' here will now be the 'order_number' from the URL (e.g., ORD-7X91B)
  const { id } = await params; 
  const supabase = await createClient();

  // 1. Fetch Order by 'order_number' instead of 'id'
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", id) // SECURITY FIX
    .single();

  if (!order) notFound();

  // 2. Fetch Items using the order's numeric ID (found in the previous step)
  const { data: items } = await supabase
    .from("order_items")
    .select(`*, products (slug, image_urls)`)
    .eq("order_id", order.id);

  const orderItems = items || [];
  const orderDate = new Date(order.created_at);
  const isCancellable = order.status === 'pending';

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

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-4">
      
      {/* Top Navigation - Fixed Alignment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 'items-start' on parent div (implicit) keeps this left aligned */}
        <Button variant="ghost" asChild className="-ml-3 gap-2 text-muted-foreground hover:text-foreground w-fit">
          <Link href="/orders"><ArrowLeft className="w-4 h-4" /> Back to Orders</Link>
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          {isCancellable && <div className="flex-1 sm:flex-none"><CancelOrderButton orderId={order.id} /></div>}
          <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none bg-white">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-gray-200 shadow-sm py-0 gap-0">
            <CardHeader className="bg-gray-50/50 border-b py-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    Order {order.order_number}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Placed on {orderDate.toLocaleDateString('en-IN', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={`px-3 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>

            {/* Content: P-0 allows the table/list to touch edges */}
            <CardContent className="p-0">
              
              {/* --- DESKTOP VIEW (Table) --- */}
              <div className="hidden sm:block">
                <div className="bg-gray-50/30 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-4 border-b border-gray-100">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {orderItems.map((item) => {
                    const imgUrl = item.products?.image_urls?.[0];
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors">
                        <div className="col-span-6 flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-md border border-gray-200 bg-white relative overflow-hidden shrink-0">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={item.product_name} fill className="object-cover" />
                            ) : (
                              <ShoppingBag className="w-5 h-5 absolute inset-0 m-auto text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate" title={item.product_name}>
                              {item.product_name}
                            </p>
                            {item.variant_name && (
                              <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5 font-normal bg-gray-100 text-gray-600">
                                {item.variant_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 text-right text-sm text-gray-600">₹{item.unit_price}</div>
                        <div className="col-span-2 text-center text-sm font-medium text-gray-900">{item.quantity}</div>
                        <div className="col-span-2 text-right text-sm font-bold text-gray-900">₹{item.total_price}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- MOBILE VIEW (Card Stack) --- */}
              <div className="sm:hidden divide-y divide-gray-100">
                {orderItems.map((item) => {
                  const imgUrl = item.products?.image_urls?.[0];
                  return (
                    <div key={item.id} className="p-4 flex gap-4">
                      {/* Image Left */}
                      <div className="h-20 w-20 rounded-lg border border-gray-200 bg-gray-50 relative overflow-hidden shrink-0">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.product_name} fill className="object-cover" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 absolute inset-0 m-auto text-gray-300" />
                        )}
                      </div>

                      {/* Content Right */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">
                            {item.product_name}
                          </p>
                          {item.variant_name && (
                            <span className="text-xs text-gray-500 mt-1 inline-block">
                              Variant: {item.variant_name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-end justify-between mt-2">
                          <div className="text-xs text-gray-500">
                            {item.quantity} <span className="text-gray-300 mx-1">x</span> ₹{item.unit_price}
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            ₹{item.total_price}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary & Sidebar */}
        <div className="space-y-6">
          
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-2">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm gap-2">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-base">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="flex gap-3">
                 <div className="bg-blue-50 p-2 h-fit rounded-full text-blue-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-medium text-sm text-gray-900">Address</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {order.delivery_address || "No address captured"}
                    </p>
                 </div>
              </div>

              <div className="flex gap-3">
                 <div className="bg-blue-50 p-2 h-fit rounded-full text-blue-600 shrink-0">
                    <Phone className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-medium text-sm text-gray-900">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_phone || "No phone captured"}
                    </p>
                 </div>
              </div>

              {order.delivery_email && (
                <div className="flex gap-3">
                   <div className="bg-blue-50 p-2 h-fit rounded-full text-blue-600 shrink-0">
                      <Mail className="w-4 h-4" />
                   </div>
                   <div className="space-y-1">
                      <p className="font-medium text-sm text-gray-900">Email</p>
                      <p className="text-sm text-muted-foreground break-all">
                        {order.delivery_email}
                      </p>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}