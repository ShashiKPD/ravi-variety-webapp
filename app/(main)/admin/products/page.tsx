import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Edit, Plus, Search, AlertCircle, Package, Star } from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";
import ProductFilters from "../components/products/ProductFilters"; 

// Update Types
type SearchParams = Promise<{ 
  q?: string; 
  brand?: string; 
  category?: string; 
  status?: string; 
  featured?: string; // New Param
  page?: string;
}>;

export default async function ProductListPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const query = searchParams.q || "";
  const brandId = searchParams.brand !== "all" ? searchParams.brand : null;
  const categoryId = searchParams.category !== "all" ? searchParams.category : null;
  const status = searchParams.status || "all";
  const isFeatured = searchParams.featured === "true"; // Parse Boolean

  // 1. Fetch Metadata for Filters
  const [brandsRes, categoriesRes] = await Promise.all([
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  // 2. Build Product Query
  let dbQuery = supabase
    .from("products")
    .select(`
      id, name, sku, stock_quantity, image_urls, is_featured, created_at,
      product_groups!inner (
        name,
        brand_id,
        category_id,
        brands (name),
        categories (name)
      ),
      price_tiers (
        role,
        min_quantity,
        unit_price
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  // --- Apply Filters ---
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`);
  }
  if (brandId) {
    dbQuery = dbQuery.eq("product_groups.brand_id", brandId);
  }
  if (categoryId) {
    dbQuery = dbQuery.eq("product_groups.category_id", categoryId);
  }
  if (status === "low") {
    dbQuery = dbQuery.lt("stock_quantity", 10);
  } else if (status === "out") {
    dbQuery = dbQuery.eq("stock_quantity", 0);
  }
  // NEW: Featured Filter
  if (isFeatured) {
    dbQuery = dbQuery.eq("is_featured", true);
  }

  const { data: products, error } = await dbQuery;

  if (error) {
    console.error("Error fetching inventory:", error);
  }

  const truncate = (str: string | undefined, len: number) => {
    if (!str) return "";
    return str.length > len ? str.substring(0, len) + "..." : str;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin" label="Back to Dashboard" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
            <p className="text-sm text-gray-500">
              {products?.length || 0} products found
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto active:scale-95 transition-all shadow-sm">
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <ProductFilters 
          brands={brandsRes.data || []} 
          categories={categoriesRes.data || []} 
        />
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="w-20 pl-6">Image</TableHead>
              <TableHead>Product Details</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Price (Retailer)</TableHead>
              <TableHead className="w-[80px] text-right pr-6">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((p: any) => {
                const retailerPrice = p.price_tiers?.find(
                  (t: any) => t.role === 'retailer' && t.min_quantity === 1
                );

                return (
                  <TableRow key={p.id} className="hover:bg-gray-50/50 group">
                    <TableCell className="pl-6 py-3">
                      <div className="w-12 h-12 rounded-lg border bg-gray-50 relative overflow-hidden shrink-0">
                        {p.image_urls?.[0] ? (
                          <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[240px]">
                        <span className="font-medium text-gray-900 text-sm truncate" title={p.name}>
                          {p.name} 
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                          <span title={p.product_groups?.brands?.name} className="bg-gray-100 px-1.5 rounded text-gray-600">
                            {truncate(p.product_groups?.brands?.name, 15)}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span title={p.product_groups?.name}>
                            {truncate(p.product_groups?.name, 20)}
                          </span>
                        </div>
                        {p.is_featured && (
                           <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-medium">
                             <Star className="w-3 h-3 fill-current" /> Featured
                           </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border">
                        {p.sku}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-medium inline-flex items-center gap-1.5 ${p.stock_quantity < 10 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-full" : "text-gray-700"}`}>
                        {p.stock_quantity < 10 && <AlertCircle className="w-3 h-3" />}
                        {p.stock_quantity}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {retailerPrice ? `₹${retailerPrice.unit_price}` : <span className="text-gray-400 italic text-xs">--</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90 transition-all">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="w-8 h-8 text-gray-300" />
                    <p>No products found matching filters.</p>
                    <Button variant="link" asChild className="text-blue-600 mt-1 h-auto p-0">
                      <Link href="/admin/products">Clear Filters</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden space-y-3">
        {products && products.length > 0 ? (
          products.map((p: any) => {
            const retailerPrice = p.price_tiers?.find(
              (t: any) => t.role === 'retailer' && t.min_quantity === 1
            );

            return (
              <div key={p.id} className="bg-white border rounded-xl p-4 shadow-sm relative active:border-blue-300 transition-colors">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg border bg-gray-50 relative overflow-hidden shrink-0">
                    {p.image_urls?.[0] ? (
                      <Image src={p.image_urls[0]} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    {p.is_featured && (
                      <div className="absolute top-0 left-0 bg-amber-400 text-amber-950 text-[9px] font-bold px-1.5 py-0.5 rounded-br-md shadow-sm z-10">
                        FEATURED
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug" title={p.name}>
                          {p.name}
                        </h3>
                        <Link 
                          href={`/admin/products/${p.id}/edit`} 
                          className="p-1.5 -mr-1.5 -mt-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full active:scale-90 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1.5">
                        <span className="font-medium text-gray-700 bg-gray-100 px-1.5 rounded">
                          {truncate(p.product_groups?.brands?.name, 12)}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="truncate max-w-[80px]">
                          {truncate(p.product_groups?.name, 15)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wide">Stock</span>
                        <div className={`text-sm font-bold flex items-center gap-1.5 ${p.stock_quantity < 10 ? "text-red-600" : "text-gray-700"}`}>
                          {p.stock_quantity < 10 ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                          {p.stock_quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wide block">Price</span>
                        <span className="text-base font-bold text-gray-900">
                          {retailerPrice ? `₹${retailerPrice.unit_price}` : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-dashed rounded-lg p-10 text-center text-gray-500">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No products found.</p>
            <Button variant="link" asChild className="text-blue-600 mt-1 h-auto p-0">
              <Link href="/admin/products">Clear Filters</Link>
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}