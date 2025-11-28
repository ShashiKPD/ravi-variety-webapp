import { createClient } from "@/utils/supabase/server";
import ProductStackForm from "../../components/ProductStackForm";

export default async function NewProductPage() {
  const supabase = await createClient();

  // Updated Query: select products(sku) to get related SKUs
  const [catRes, brandRes, groupRes] = await Promise.all([
    supabase.from("categories").select("id, name").order('name'),
    supabase.from("brands").select("id, name").order('name'),
    supabase.from("product_groups")
      .select("id, name, brand_id, brands(name), products(sku)") // Fetch SKUs here
      .order('name'),
  ]);

  const categories = catRes.data || [];
  const brands = brandRes.data || [];
  
  // Transform Data: Flatten SKUs into a single searchable string
  const existingGroups = (groupRes.data || []).map((g: any) => ({
    id: g.id,
    name: g.name, 
    brandName: g.brands?.name,
    // Create a string like "SKU-A, SKU-B" for easy searching
    skus: g.products?.map((p: any) => p.sku).join(", ") || "" 
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      <ProductStackForm 
        categories={categories} 
        brands={brands} 
        existingGroups={existingGroups} 
      />
    </div>
  );
}