import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertCircle } from "lucide-react";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // 1. Fetch Orders (Removed 'email' from profiles select)
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total_amount,
      status,
      profiles (
        full_name,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin Orders Error:", error);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
      case "approved": return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
      case "delivered": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
      case "rejected": return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <Badge variant="outline" className="px-3 py-1">
          Total: {orders?.length || 0}
        </Badge>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
                const customerName = profile?.full_name || "Unknown User";
                const customerRole = profile?.role || "N/A";

                return (
                  <TableRow key={order.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-mono font-medium text-xs">
                      #{order.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm">{customerName}</span>
                        <span className="text-xs text-gray-500 capitalize">{customerRole}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      ₹{order.total_amount}
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize shadow-none font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="h-8">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="w-4 h-4 mr-2 text-gray-500" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                    <p>No orders found.</p>
                    {error && <p className="text-xs text-red-500">Error: {error.message}</p>}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}