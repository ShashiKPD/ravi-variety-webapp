import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Printer, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck,
  Share2
} from "lucide-react";
import CancelOrderButton from "../../components/CancelOrderButton";
import BackButton from "@/app/(main)/components/BackButton"; // Using our smart back button

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // 'id' here is the 'order_number' from the URL (e.g., ORD-7X91B)
  const { id } = await params; 
  const supabase = await createClient();

  // 1. Auth Check (Redirect if not logged in)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/orders/${id}`);
  }

  // 2. Fetch User Role
  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 3. Fetch Order by 'order_number'
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", id) 
    .single();

  if (!order) notFound();

  // 4. Security Check (Owner or Admin)
  const isOwner = order.user_id === user.id;
  const isAdmin = viewerProfile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <ShieldCheck className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-500">You do not have permission to view this order.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  // 5. Fetch Items
  const { data: items } = await supabase
    .from("order_items")
    .select(`*, products (slug, image_urls)`)
    .eq("order_id", order.id);

  const orderItems = items || [];
  const orderDate = new Date(order.created_at);
  // Allow cancellation only if pending AND (viewer is owner OR admin)
  const isCancellable = order.status === 'pending' && (isOwner || isAdmin);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-blue-50 text-blue-700 border-blue-200";
      case "delivered": return "bg-green-50 text-green-700 border-green-200";
      case "rejected": return "bg-red-50 text-red-700 border-red-200";
      case "cancelled": return "bg-gray-50 text-gray-700 border-gray-200";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BackButton href="/orders" label="Back to Orders" />
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Share Button (Desktop only for now, or make responsive) */}
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 bg-white">
             <Share2 className="w-4 h-4" /> Share
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none bg-white">
            <Printer className="w-4 h-4" /> Print
          </Button>
          
          {isCancellable && (
             <div className="flex-1 sm:flex-none">
               <CancelOrderButton orderId={order.id} />
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b py-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    Order #{order.order_number}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    Placed on {orderDate.toLocaleDateString('en-IN', { 
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {orderItems.map((item) => {
                    const imgUrl = item.products?.image_urls?.[0];
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors group">
                        <div className="col-span-6 flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-md border border-gray-200 bg-white relative overflow-hidden shrink-0">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={item.product_name} fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-gray-300">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/p/${item.products?.slug}/${item.product_id}`} className="font-medium text-sm text-gray-900 truncate block hover:text-blue-600 transition-colors" title={item.product_name}>
                              {item.product_name}
                            </Link>
                            <div className="flex gap-2 mt-1">
                              {item.variant_name && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal bg-gray-100 text-gray-600 border border-gray-200">
                                  {item.variant_name}
                                </Badge>
                              )}
                              {item.unit_name && (
                                <span className="text-[10px] text-gray-400 self-center">
                                  / {item.unit_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-right text-sm text-gray-600 font-medium">₹{item.unit_price}</div>
                        <div className="col-span-2 text-center text-sm font-bold text-gray-900 bg-gray-50 py-1 rounded mx-auto w-12">{item.quantity}</div>
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
                          <div className="flex items-center justify-center w-full h-full text-gray-300">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Content Right */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">
                            {item.product_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.variant_name && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {item.variant_name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-2">
                          <div className="text-xs text-gray-500 font-medium">
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

              {/* Footer Total */}
              <div className="bg-gray-50 p-4 sm:px-6 border-t border-gray-200 flex justify-between items-center gap-4">
                 <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Grand Total</span>
                 <span className="text-xl font-bold text-gray-900">₹{order.total_amount}</span>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary & Sidebar */}
        <div className="space-y-6">
          
          {/* Status Note */}
          {order.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Order Pending Approval</p>
              <p className="text-xs opacity-90">
                Your order has been sent to the supplier. You will be notified once it is approved and invoiced.
              </p>
            </div>
          )}

          <Card className="border-gray-200 shadow-sm gap-2">
            <CardHeader className="border-b bg-gray-50/50 py-4">
              <CardTitle className="text-base">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="flex gap-3">
                 <div className="bg-blue-50 p-2 h-fit rounded-full text-blue-600 shrink-0">
                   <MapPin className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                   <p className="font-medium text-sm text-gray-900">Address</p>
                   <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                     {order.delivery_address || "No address captured"}
                   </p>
                 </div>
              </div>

              <div className="flex gap-3">
                 <div className="bg-green-50 p-2 h-fit rounded-full text-green-600 shrink-0">
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
                   <div className="bg-purple-50 p-2 h-fit rounded-full text-purple-600 shrink-0">
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