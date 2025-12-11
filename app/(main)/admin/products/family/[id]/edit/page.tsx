import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductStackForm from "../../../../components/ProductStackForm"; // Ensure path is correct relative to your structure
import BackButton from "@/app/(main)/components/BackButton";

export default async function EditFamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const supabase = await createClient();

  // 1. Fetch Group
  const { data: group, error: groupError } = await supabase
    .from("product_groups")
    .select("id, name, brand_id, category_id")
    .eq("id", id)
    .single();

  if (groupError || !group) return notFound();

  // 2. Fetch Variants with Tiers
  const { data: variants, error: varError } = await supabase
    .from("products")
    .select(`
      *,
      price_tiers ( role, unit_price, mrp, min_quantity )
    `)
    .eq("group_id", id)
    .order("id");

  if (varError) console.error(varError);

  const flattenedVariants = (variants || []).map((v: any) => {
    // Extract Base Prices
    const retailer = v.price_tiers?.find((p: any) => p.role === 'retailer' && p.min_quantity === 1);
    const wholesaler = v.price_tiers?.find((p: any) => p.role === 'wholesaler' && p.min_quantity === 1);
    
    return {
      ...v,
      mrp: retailer?.mrp || 0,
      price_retailer: retailer?.unit_price || 0,
      price_wholesaler: wholesaler?.unit_price || 0,
      // price_tiers array is passed for the form to handle bulk tiers
    };
  });

  // 3. Fetch Metadata (Updated to support Dependent Dropdowns)
  const [catRes, brandRes, unitRes] = await Promise.all([
    // Categories: Only fetch those linked to a brand (!inner join)
    supabase
      .from("categories")
      .select("id, name, brand_categories!inner(brand_id)")
      .order('name'),

    // Brands: Fetch with their linked category IDs
    supabase
      .from("brands")
      .select("id, name, brand_categories(category_id)")
      .order('name'),

    // Units
    supabase.from("units").select("id, name, short_name").order('name') 
  ]);

  // Transform Data for Form Props
  const categories = (catRes.data || []).map((c: any) => ({
    id: c.id,
    name: c.name
  }));

  const brands = (brandRes.data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    categoryIds: b.brand_categories?.map((bc: any) => bc.category_id) || []
  }));

  const units = unitRes.data || [];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin/products" label="Back to Inventory" />
        <div className="mt-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Product Family</h1>
          <p className="text-sm text-gray-500">
            Editing family <span className="font-medium text-gray-900">"{group.name}"</span>
          </p>
        </div>
      </div>
      
      <ProductStackForm
        categories={categories}
        brands={brands}
        units={units} 
        existingGroups={[]} // Not needed in edit mode
        initialData={{
          groupId: group.id,
          brandId: group.brand_id,
          categoryId: group.category_id,
          variants: flattenedVariants
        }}
      />
    </div>
  );
}