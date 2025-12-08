import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Calendar, AlertCircle } from "lucide-react";
import OrderActions from "../../components/orders/OrderActions"; 

export default async function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Order (Supports both Order Number string and Numeric ID)
  const isNumericId = /^\d+$/.test(id);
  let query = supabase.from("orders").select(`*, profiles(full_name, role)`);
  
  if (isNumericId) query = query.eq("id", id);
  else query = query.eq("order_number", id);

  const { data: order } = await query.single();

  if (!order) notFound();

  // 2. Fetch Items
  const { data: items } = await supabase
    .from("order_items")
    .select(`*, products ( stock_quantity, sku )`)
    .eq("order_id", order.id);

  // Helpers
  const orderDate = new Date(order.created_at);
  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
  
  const statusStyles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-blue-100 text-blue-800 border-blue-200",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  }[order.status as string] || "bg-gray-100 text-gray-800";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-32 space-y-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/orders" 
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Order {order.order_number}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              <span className="text-gray-300">•</span>
              <Clock className="w-3.5 h-3.5" />
              {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${statusStyles}`}>
          {order.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- MAIN CONTENT --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ITEMS CONTAINER */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Items Ordered</h2>
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
                {items?.length || 0} Items
              </span>
            </div>

            {/* A. DESKTOP VIEW (HTML Table) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Product</th>
                    <th className="px-6 py-3 font-semibold text-center">Req / Stock</th>
                    <th className="px-6 py-3 font-semibold text-right">Unit Price</th>
                    <th className="px-6 py-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items && items.map((item: any) => {
                    const currentStock = item.products?.stock_quantity || 0;
                    const isShortage = order.status === 'pending' && currentStock < item.quantity;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900 line-clamp-2" title={item.product_name}>
                              {item.product_name}
                            </span>
                            <div className="flex items-center gap-2">
                              {item.variant_name && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                  {item.variant_name}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-mono">
                                {item.products?.sku || 'NO SKU'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-900 text-base">{item.quantity}</span>
                            <div className={`text-xs flex items-center gap-1 ${isShortage ? "text-red-600 font-bold" : "text-gray-400"}`}>
                              <span>Stock: {currentStock}</span>
                              {isShortage && <AlertCircle className="w-3 h-3" />}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          ₹{item.unit_price}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          ₹{item.total_price}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* B. MOBILE VIEW (Card Stack) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {items && items.map((item: any) => {
                const currentStock = item.products?.stock_quantity || 0;
                const isShortage = order.status === 'pending' && currentStock < item.quantity;

                return (
                  <div key={item.id} className="p-4 flex flex-col gap-3">
                    {/* Top: Name & SKU */}
                    <div>
                      <div className="font-medium text-sm text-gray-900 leading-snug">
                        {item.product_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.variant_name && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                            {item.variant_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-mono">
                          {item.products?.sku}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Stats Row */}
                    <div className="flex items-end justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex flex-col">
                          <span className="text-gray-500 uppercase text-[10px]">Qty</span>
                          <span className="font-bold text-gray-900 text-sm">{item.quantity}</span>
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="flex flex-col">
                          <span className="text-gray-500 uppercase text-[10px]">Stock</span>
                          <span className={`font-semibold text-sm ${isShortage ? "text-red-600" : "text-gray-700"}`}>
                            {currentStock}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-gray-500 uppercase mb-0.5">Total</span>
                        <span className="font-bold text-base text-gray-900">₹{item.total_price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary */}
            <div className="bg-gray-50 p-4 sm:px-6 border-t border-gray-200 flex justify-end">
               <div className="flex gap-4 items-baseline">
                 <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Grand Total</span>
                 <span className="text-xl font-bold text-gray-900">₹{order.total_amount}</span>
               </div>
            </div>
          </div>

          {/* ACTION SECTION */}
          {order.status === 'pending' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center justify-center sm:justify-start gap-2">
                  <AlertCircle className="w-4 h-4" /> Review Required
                </h3>
                <p className="text-xs text-blue-700 mt-1">
                  Approval triggers inventory deduction.
                </p>
              </div>
              <OrderActions orderId={order.id} />
            </div>
          )}
        </div>

        {/* --- SIDEBAR --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Customer Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">{profile?.full_name || "Guest"}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 capitalize border border-gray-200">
                  {profile?.role || "Retailer"}
                </span>
              </div>
              
              <div className="h-px bg-gray-100" />
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600 leading-relaxed">
                    {order.delivery_address || "No address captured"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`tel:${order.delivery_phone}`} className="text-blue-600 hover:underline">
                    {order.delivery_phone || "N/A"}
                  </a>
                </div>
                {order.delivery_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 break-all">{order.delivery_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-gray-900">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{orderDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Update</span>
                <span className="text-gray-900">{new Date(order.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}