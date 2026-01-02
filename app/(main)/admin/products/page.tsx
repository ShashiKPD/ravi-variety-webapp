import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";
import ProductFilters from "../components/products/ProductFilters"; 
import InventoryDesktopTable from "../components/products/InventoryDesktopTable"; 
import InventoryMobileView from "../components/products/InventoryMobileView";
import { getActiveSales } from "@/app/(main)/admin/products/actions";

type SearchParams = Promise<{ 
  q?: string; 
  brand?: string; 
  category?: string; 
  status?: string; 
  featured?: string; 
  page?: string;
}>;

export default async function ProductListPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const query = searchParams.q || "";
  const brandId = searchParams.brand !== "all" ? searchParams.brand : null;
  const categoryId = searchParams.category !== "all" ? searchParams.category : null;
  const status = searchParams.status || "all";
  const isFeatured = searchParams.featured === "true";

  // 1. Fetch Metadata (Modified to include Relations)
  const [brandsRes, categoriesRes, activeSales] = await Promise.all([
    // Fetch Brands with Category IDs
    supabase
      .from("brands")
      .select("id, name, brand_categories(category_id)")
      .order("name"),
    
    // Fetch Categories with Brand IDs
    supabase
      .from("categories")
      .select("id, name, brand_categories(brand_id)")
      .order("name"),
      
    getActiveSales()
  ]);

  // Transform for Frontend
  const brands = (brandsRes.data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    categoryIds: b.brand_categories?.map((bc: any) => bc.category_id) || []
  }));

  const categories = (categoriesRes.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    brandIds: c.brand_categories?.map((bc: any) => bc.brand_id) || []
  }));

  // 2. Build Product Query
  let dbQuery = supabase
    .from("products")
    .select(`
      id, name, sku, stock_quantity, image_urls, is_featured, created_at,
      pack_size, options,
      units (short_name),
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
      ),
      sale_items (
        sale_id,
        discount_type,
        discount_value
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    // .limit(50);

  if (query) dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`);
  if (brandId) dbQuery = dbQuery.eq("product_groups.brand_id", brandId);
  if (categoryId) dbQuery = dbQuery.eq("product_groups.category_id", categoryId);
  if (status === "low") dbQuery = dbQuery.lt("stock_quantity", 10);
  else if (status === "out") dbQuery = dbQuery.eq("stock_quantity", 0);
  if (isFeatured) dbQuery = dbQuery.eq("is_featured", true);

  const { data: productsRaw, error, count } = await dbQuery;

  if (error) console.error("Error fetching inventory:", error);

  // 3. Transform Data
  const products = (productsRaw || []).map((p: any) => {
    const retailerPrice = p.price_tiers?.find((t: any) => t.role === 'retailer' && t.min_quantity === 1);
    const wholesalerPrice = p.price_tiers?.find((t: any) => t.role === 'wholesaler' && t.min_quantity === 1);
    const activeDiscount = p.sale_items?.[0] || null;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      image_url: p.image_urls?.[0] || null,
      stock_quantity: p.stock_quantity,
      price_retailer: retailerPrice?.unit_price || 0,
      price_wholesaler: wholesalerPrice?.unit_price || 0,
      sale_id: activeDiscount?.sale_id || null,
      discount_type: activeDiscount?.discount_type || null,
      discount_value: activeDiscount?.discount_value || null,
      is_featured: p.is_featured,
      pack_size: p.pack_size || 1,
      unit_name: p.units?.short_name || "Units",
      variant_name: p.options?.size || "Default",
      brand_name: p.product_groups?.brands?.name || "Unknown",
      category_name: p.product_groups?.categories?.name || "Unknown",
      group_name: p.product_groups?.name || "Unknown"
    };
  });

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 pb-24">
      <div className="flex flex-col gap-1">
        <BackButton href="/admin" label="Back to Dashboard" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
            <p className="text-sm text-gray-500">{count || 0} products found</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-sm">
            <Link href="/admin/products/new"><Plus className="w-4 h-4 mr-2" /> Add New Product</Link>
          </Button>
        </div>
      </div>

      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <ProductFilters 
          brands={brands} 
          categories={categories} 
        />
      </div>

      <div className="hidden md:block">
        <InventoryDesktopTable 
          products={products} 
          sales={activeSales || []} 
          totalCount={count || 0}
          filterParams={{ 
            p_search_text: query || null,
            p_brand_ids: brandId ? [Number(brandId)] : null,
            p_category_ids: categoryId ? [Number(categoryId)] : null,
          }}
        />
      </div>

      <div className="md:hidden">
        <InventoryMobileView products={products} />
      </div>
    </div>
  );
}