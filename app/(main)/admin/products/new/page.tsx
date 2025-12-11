import { createClient } from "@/utils/supabase/server";
import ProductStackForm from "../../components/ProductStackForm";
import BackButton from "@/app/(main)/components/BackButton";

export default async function NewProductPage() {
  const supabase = await createClient();

  const [catRes, brandRes, groupRes, unitRes] = await Promise.all([
    // 1. Categories: Only fetch those linked to a brand (!inner join)
    supabase
      .from("categories")
      .select("id, name, brand_categories!inner(brand_id)")
      .order('name'),

    // 2. Brands: Fetch with their linked category IDs
    supabase
      .from("brands")
      .select("id, name, brand_categories(category_id)")
      .order('name'),

    // 3. Existing Groups
    supabase
      .from("product_groups")
      .select("id, name, brand_id, brands(name), products(sku)")
      .order('name'),

    // 4. Units
    supabase.from("units").select("id, name, short_name").order('name')
  ]);

  // Transform Data
  const categories = (catRes.data || []).map((c: any) => ({
    id: c.id,
    name: c.name
  }));

  // Pass categoryIds with brands for frontend filtering logic
  const brands = (brandRes.data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    categoryIds: b.brand_categories?.map((bc: any) => bc.category_id) || []
  }));

  const units = unitRes.data || [];

  const existingGroups = (groupRes.data || []).map((g: any) => ({
    id: g.id,
    name: g.name, 
    brandName: g.brands?.name,
    skus: g.products?.map((p: any) => p.sku).join(", ") || "" 
  }));

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-32">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin/products" label="Back to Inventory" />
        <div className="mt-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Product</h1>
          <p className="text-sm text-gray-500">Create a single product or a family of variants.</p>
        </div>
      </div>
      
      <ProductStackForm 
        categories={categories} 
        brands={brands} 
        existingGroups={existingGroups} 
        units={units} 
      />
    </div>
  );
}