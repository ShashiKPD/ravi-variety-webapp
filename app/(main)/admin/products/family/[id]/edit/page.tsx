import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductStackForm from "../../../../components/ProductStackForm"; // Check path
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
    
    // The rest of the tiers (bulk) will be handled by the form's initializer
    // We just need to ensure 'price_tiers' is passed along in the variant object
    return {
      ...v,
      mrp: retailer?.mrp || 0,
      price_retailer: retailer?.unit_price || 0,
      price_wholesaler: wholesaler?.unit_price || 0,
      // price_tiers array is already included via spread
    };
  });

  // 3. Fetch Metadata
  const [catRes, brandRes, unitRes] = await Promise.all([
    supabase.from("categories").select("id, name").order('name'),
    supabase.from("brands").select("id, name").order('name'),
    supabase.from("units").select("id, name, short_name").order('name') 
  ]);

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
        categories={catRes.data || []}
        brands={brandRes.data || []}
        units={unitRes.data || []} 
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