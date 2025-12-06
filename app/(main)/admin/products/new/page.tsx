import { createClient } from "@/utils/supabase/server";
import ProductStackForm from "../../components/ProductStackForm";
import BackButton from "@/app/(main)/components/BackButton";

export default async function NewProductPage() {
  const supabase = await createClient();

  const [catRes, brandRes, groupRes, unitRes] = await Promise.all([
    supabase.from("categories").select("id, name").order('name'),
    supabase.from("brands").select("id, name").order('name'),
    supabase.from("product_groups")
      .select("id, name, brand_id, brands(name), products(sku)")
      .order('name'),
    supabase.from("units").select("id, short_name").order('short_name')
  ]);

  const categories = catRes.data || [];
  const brands = brandRes.data || [];
  const units = unitRes.data || [];

  const existingGroups = (groupRes.data || []).map((g: any) => ({
    id: g.id,
    name: g.name, 
    brandName: g.brands?.name,
    skus: g.products?.map((p: any) => p.sku).join(", ") || "" 
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      
      {/* Back Button to Admin Panel */}
      <BackButton href="/admin" label="Back to Dashboard" />

      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      
      <ProductStackForm 
        categories={categories} 
        brands={brands} 
        existingGroups={existingGroups} 
        units={units} 
      />
    </div>
  );
}