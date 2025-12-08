import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, User, Calendar, Package, Clock, ChevronRight } from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      created_at,
      total_amount,
      status,
      profiles (
        full_name,
        role
      ),
      order_items (
        id
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin Orders Error:", error);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
      case "approved": return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin" label="Back to Dashboard" />
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <Badge variant="outline" className="px-3 py-1 bg-white">
            Total: {orders?.length || 0}
          </Badge>
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-28 pl-6">Order ID</TableHead>
              <TableHead className="w-40">Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-10 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
                const customerName = profile?.full_name || "Unknown User";
                const itemCount = order.order_items.length;
                const date = new Date(order.created_at);

                return (
                  // Making the row clickable by wrapping cells in Link is tricky in standard tables.
                  // Instead, we use a relative positioning trick with an absolute link overlay.
                  <TableRow key={order.id} className="group relative hover:bg-gray-50/80 transition-colors cursor-pointer">
                    
                    {/* Order ID */}
                    <TableCell className="font-mono font-medium text-xs text-gray-600 pl-6 py-4">
                      {order.order_number || `#${order.id}`}
                      {/* The Link covers the whole row */}
                      <Link 
                        href={`/admin/orders/${order.order_number || order.id}`} 
                        className="absolute inset-0 z-10"
                      />
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {date.toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-gray-700 text-sm">{customerName}</span>
                      </div>
                    </TableCell>

                    {/* Items */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-normal text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        {itemCount}
                      </Badge>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right font-bold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge className={`capitalize shadow-none px-2.5 py-0.5 font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </TableCell>

                    {/* Chevron */}
                    <TableCell className="text-right pr-6">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </TableCell>

                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                    <p>No orders found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden space-y-3">
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
            const customerName = profile?.full_name || "Unknown User";
            const itemCount = order.order_items.length;

            return (
              <Link key={order.id} href={`/admin/orders/${order.order_number || order.id}`} className="block group">
                <div className="bg-white border rounded-lg p-4 shadow-sm active:scale-[0.98] transition-all duration-200">
                  
                  {/* Header: ID, Date, Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-gray-900 block">
                        {order.order_number || `#${order.id}`}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge className={`capitalize shadow-none px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>

                  {/* Body: Customer & Stats */}
                  <div className="flex justify-between items-end border-t pt-3 mt-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="bg-gray-100 p-1.5 rounded-full">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium">{customerName}</span>
                    </div>
                    
                    <div className="text-right">
                      {/* Item Count Badge next to Price */}
                      <div className="flex items-center justify-end gap-2 mb-0.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-sm">
                          <Package className="w-3 h-3" /> {itemCount}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 leading-none">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            );
          })
        ) : (
          <div className="bg-white border border-dashed rounded-lg p-8 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No orders found.</p>
          </div>
        )}
      </div>

    </div>
  );
}