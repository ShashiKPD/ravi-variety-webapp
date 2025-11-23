import { createClient } from "@/utils/supabase/server";
// import SmartProductForm from "../../components/SmartProductForm";
import ProductStackForm from "../../components/ProductStackForm";

export default async function NewProductPage() {
  const supabase = await createClient();

  // Fetch Categories and Brands for the dropdowns
  const [catRes, brandRes] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("brands").select("id, name"),
  ]);

  const categories = catRes.data || [];
  const brands = brandRes.data || [];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductStackForm categories={categories} brands={brands} />
    </div>
  );
}