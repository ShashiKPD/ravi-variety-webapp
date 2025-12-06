import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductStackForm from "../../../../components/ProductStackForm";

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

  // 2. Fetch Variants
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
    const retailer = v.price_tiers.find((p: any) => p.role === 'retailer' && p.min_quantity === 1);
    const wholesaler = v.price_tiers.find((p: any) => p.role === 'wholesaler' && p.min_quantity === 1);
    
    return {
      ...v,
      mrp: retailer?.mrp || 0,
      price_retailer: retailer?.unit_price || 0,
      price_wholesaler: wholesaler?.unit_price || 0,
    };
  });

  // 3. Fetch Metadata (Now includes Units)
  const [catRes, brandRes, unitRes] = await Promise.all([
    supabase.from("categories").select("id, name").order('name'),
    supabase.from("brands").select("id, name").order('name'),
    // Added Unit Fetch
    supabase.from("units").select("id, name, short_name").order('name') 
  ]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product Family: {group.name}</h1>
      
      <ProductStackForm
        categories={catRes.data || []}
        brands={brandRes.data || []}
        units={unitRes.data || []} // Passed units prop
        existingGroups={[]} 
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