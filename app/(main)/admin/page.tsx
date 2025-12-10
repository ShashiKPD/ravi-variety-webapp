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
  Settings,
  AlertCircle,
  LayoutTemplate,
  Ruler,
  Layers,
  ChevronRight,
  Percent, // <--- New Icon for Sales
  Megaphone // Alternative Icon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only fetch actionable data
  const [pendingOrdersRes, lowStockRes, activeSalesRes] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }).lt("stock_quantity", 10),
    supabase.from("sales").select("*", { count: "exact", head: true }).eq("is_active", true) // Count active sales
  ]);

  const pendingCount = pendingOrdersRes.count || 0;
  const lowStockCount = lowStockRes.count || 0;
  const activeSalesCount = activeSalesRes.count || 0;

  // Shared classes for mobile-friendly buttons
  const btnClass = "w-full justify-between active:scale-95 transition-all duration-200";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your store operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. ORDERS (Priority) */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Orders
              </CardTitle>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="shadow-sm animate-pulse">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
            <CardDescription>Manage incoming orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className={`${btnClass} bg-blue-600 hover:bg-blue-700`}>
              <Link href="/admin/orders">
                 View All Orders <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 3. INVENTORY */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-gray-600" />
                Products
              </CardTitle>
              {lowStockCount > 0 && (
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {lowStockCount} Low Stock
                </Badge>
              )}
            </div>
            <CardDescription>Catalog & stock management.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className={btnClass}>
              <Link href="/admin/products">List</Link>
            </Button>
            <Button asChild variant="default" className={`${btnClass} bg-gray-900 text-white hover:bg-gray-800`}>
              <Link href="/admin/products/new">Add New</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 2. SALES & CAMPAIGNS (New Card) */}
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Percent className="w-5 h-5 text-red-500" />
                Sales
              </CardTitle>
              {activeSalesCount > 0 && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none">
                  {activeSalesCount} Active
                </Badge>
              )}
            </div>
            <CardDescription>Manage events & discounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className={`${btnClass} bg-gray-900 text-white hover:bg-gray-800`}>
              <Link href="/admin/sales">
                 Manage Campaigns <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 5. USERS */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-gray-600" />
              Users
            </CardTitle>
            <CardDescription>Retailers & Wholesalers.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="outline" className={btnClass}>
               <Link href="/admin/users">
                 Manage Users <ChevronRight className="w-4 h-4 text-gray-400" />
               </Link>
             </Button>
          </CardContent>
        </Card>

        {/* 4. CATALOG CONFIG */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tags className="w-5 h-5 text-gray-600" />
              Taxonomy
            </CardTitle>
            <CardDescription>Categories & Brands.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
             <Button asChild variant="outline" className={btnClass}>
               <Link href="/admin/categories/new">
                 Categories <ChevronRight className="w-4 h-4 text-gray-400" />
               </Link>
             </Button>
             <Button asChild variant="outline" className={btnClass}>
               <Link href="/admin/brands/new">
                 Brands <ChevronRight className="w-4 h-4 text-gray-400" />
               </Link>
             </Button>
             <Button asChild variant="outline" className={btnClass}>
              <Link href="/admin/supercategories/new">
                Supercategories <Layers className="w-4 h-4 text-gray-400" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* 6. CONTENT */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutTemplate className="w-5 h-5 text-gray-600" />
              Content
            </CardTitle>
            <CardDescription>Homepage banners & visuals.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="outline" className={btnClass}>
               <Link href="/admin/banners">
                 Manage Banners <ChevronRight className="w-4 h-4 text-gray-400" />
               </Link>
             </Button>
          </CardContent>
        </Card>

        {/* 7. CONFIGURATION */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-gray-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-gray-600" />
              Configuration
            </CardTitle>
            <CardDescription>Global settings & units.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className={btnClass}>
               <Link href="/admin/settings">Global Config</Link>
            </Button>
            <Button asChild variant="outline" className={btnClass}>
               <Link href="/admin/units/new"><Ruler className="w-4 h-4 mr-2"/> Units</Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}