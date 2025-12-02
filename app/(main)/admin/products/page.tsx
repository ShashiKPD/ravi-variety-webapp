import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Edit, Plus, Search, AlertCircle } from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";

type SearchParams = Promise<{ q?: string }>;

export default async function ProductListPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const supabase = await createClient();

  // 1. Build Query
  // FIX: We join price_tiers because price is not on the product table
  let dbQuery = supabase
    .from("products")
    .select(`
      id, name, sku, stock_quantity, image_urls, is_featured, created_at,
      product_groups!inner (
        name,
        brands (name)
      ),
      price_tiers (
        role,
        min_quantity,
        unit_price
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  // 2. Apply Search
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`);
  }

  const { data: products, error } = await dbQuery;

  if (error) {
    console.error("Error fetching inventory:", error);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin" label="Back to Dashboard" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
            <p className="text-sm text-gray-500">Manage catalog, prices, and stock.</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <form className="relative max-w-md" method="GET">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input 
          name="q" 
          placeholder="Search by SKU or Name..." 
          defaultValue={query}
          className="pl-9 bg-white"
        />
      </form>

      {/* Data Table */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Product Details</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Base Price (Retailer)</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((p: any) => {
                // FIX: Find the correct price from the joined tiers array
                const retailerPrice = p.price_tiers?.find(
                  (t: any) => t.role === 'retailer' && t.min_quantity === 1
                );

                return (
                  <TableRow key={p.id} className="hover:bg-gray-50/50 group">
                    {/* Image */}
                    <TableCell>
                      <div className="w-12 h-12 rounded-md border bg-gray-100 overflow-hidden relative">
                        {p.image_urls?.[0] ? (
                          <img src={p.image_urls[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="text-[10px]">No Img</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Name & Group */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{p.name}</span>
                        <span className="text-xs text-gray-500">
                          {p.product_groups?.brands?.name} • {p.product_groups?.name}
                        </span>
                        {p.is_featured && (
                           <Badge variant="secondary" className="w-fit mt-1 text-[10px] bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Featured</Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded border font-mono text-gray-700">
                        {p.sku}
                      </code>
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="text-right">
                      <div className={p.stock_quantity < 10 ? "text-red-600 font-bold" : "text-gray-900"}>
                        {p.stock_quantity}
                        {p.stock_quantity === 0 && (
                          <AlertCircle className="inline w-3 h-3 ml-1 text-red-500" />
                        )}
                      </div>
                    </TableCell>

                    {/* Prices */}
                    <TableCell className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {retailerPrice ? `₹${retailerPrice.unit_price}` : <span className="text-gray-400 italic">--</span>}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  {error ? "Error loading products." : "No products found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}