import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Printer, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck,
  Share2
} from "lucide-react";
import CancelOrderButton from "@/app/(main)/components/orders/CancelOrderButton"; // Check your path
import BackButton from "@/app/(main)/components/BackButton"; 
import OrderItemList from "@/app/(main)/components/orders/OrderItemList"; // <--- NEW IMPORT
import ShareOrderButton from "@/app/(main)/components/orders/ShareOrderButton";   // <--- NEW IMPORT

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/orders/${id}`);

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", id) 
    .single();

  if (!order) notFound();

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

  // Fetch Items
  const { data: items } = await supabase
    .from("order_items")
    .select(`*, products (slug)`)
    .eq("order_id", order.id);

  const orderItems = (items || []).map((i: any) => ({
    id: i.id,
    product_id: i.product_id,
    product_name: i.product_name,
    variant_name: i.variant_name,
    pack_size: i.pack_size || 1,
    slug: i.products?.slug,
    snapshot_image: i.snapshot_image,
    sku: i.sku,
    unit_name: i.unit_name,
    unit_price: i.unit_price,
    mrp: i.mrp,
    quantity: i.quantity,
    total_price: i.total_price
  }));

  const orderDate = new Date(order.created_at);
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
          <ShareOrderButton orderNumber={order.order_number} />
          
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 bg-white">
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
          
          {/* Main Content Container (Replaced Card) */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            
            {/* Header Section */}
            <div className="bg-gray-50/50 border-b border-gray-200 px-6 py-4">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    Order #{order.order_number}
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    Placed on {orderDate.toLocaleDateString('en-IN', { 
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>
                <Badge variant="outline" className={`px-3 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </Badge>
              </div>
            </div>

            {/* List Content */}
            <div>
              <OrderItemList items={orderItems} />

              {/* Footer Total */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-4">
                 <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Grand Total</span>
                 <span className="text-xl font-bold text-gray-900">₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-6">
          
          {order.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Order Pending Approval</p>
              <p className="text-xs opacity-90">
                Your order has been sent to the supplier. You will be notified once it is approved and invoiced.
              </p>
            </div>
          )}

          {/* Delivery Details Container (Replaced Card) */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-200 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">Delivery Details</h2>
            </div>
            
            <div className="p-4 space-y-5">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}