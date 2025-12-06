import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Package, 
  Tags, 
  Users, 
  AlertCircle,
  Scale
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [pendingOrdersRes, lowStockRes] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }).lt("stock_quantity", 10)
  ]);

  const pendingCount = pendingOrdersRes.count || 0;
  const lowStockCount = lowStockRes.count || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your B2B operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2 text-lg"><ShoppingBag className="w-5 h-5 text-blue-600" />Orders</CardTitle>
              {pendingCount > 0 && <Badge variant="destructive">{pendingCount} Pending</Badge>}
            </div>
            <CardDescription>Review pending requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700"><Link href="/admin/orders">Manage Orders</Link></Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2 text-lg"><Package className="w-5 h-5 text-gray-600" />Inventory</CardTitle>
              {lowStockCount > 0 && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50"><AlertCircle className="w-3 h-3 mr-1" />{lowStockCount} Low</Badge>}
            </div>
            <CardDescription>Manage products & stock.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button asChild variant="default" className="w-full"><Link href="/admin/products">View List</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link href="/admin/products/new">Add Item</Link></Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg"><Users className="w-5 h-5 text-gray-600" />Users</CardTitle>
            <CardDescription>Manage retailers & wholesalers.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button asChild variant="default" className="w-full"><Link href="/admin/users">View Users</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link href="/admin/users/new">Create</Link></Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg"><Tags className="w-5 h-5 text-gray-600" />Classifications</CardTitle>
            <CardDescription>Organize your catalog structure.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
               <Button asChild variant="outline" className="w-full"><Link href="/admin/categories/new">Categories</Link></Button>
               <Button asChild variant="outline" className="w-full"><Link href="/admin/brands/new">Brands</Link></Button>
            </div>
            <Button asChild variant="secondary" className="w-full"><Link href="/admin/supercategories/new">Supercategories</Link></Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg"><Scale className="w-5 h-5 text-gray-600" />Settings</CardTitle>
            <CardDescription>Manage units and banners.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full"><Link href="/admin/units/new">Selling Units</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link href="/admin/banners">Banners</Link></Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}