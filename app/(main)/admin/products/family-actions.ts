"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

// 1. DELETE ACTION
export async function deleteProductVariant(productId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  const { data: message, error } = await supabase.rpc("delete_product_variant", { p_product_id: productId });

  if (error) {
    if (error.code === '23503') return { error: "Cannot delete: Item exists in order history." };
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: message };
}

// 2. UPDATE FULL FAMILY ACTION
export async function updateProductFamily(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const groupId = formData.get("group_id");
  const brandId = formData.get("brand_id");
  const categoryId = formData.get("category_id");
  const productsMeta = JSON.parse(formData.get("products_meta") as string);

  // 1. Upload Images First (Mutate the meta object with new URLs)
  for (let i = 0; i < productsMeta.length; i++) {
    const meta = productsMeta[i];
    let finalImageUrls = meta.existing_images || []; 

    const imageCount = meta.new_image_count || 0;
    for (let j = 0; j < imageCount; j++) {
      const file = formData.get(`product_${i}_new_image_${j}`) as File;
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${i}-${j}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(fileName, file);
        if(!upErr) {
           const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
           finalImageUrls.push(data.publicUrl);
        }
      }
    }
    // Update the meta object directly
    meta.image_urls = finalImageUrls;
    
    // Generate slug for new items if missing
    if (String(meta.id).startsWith("temp-")) {
       meta.slug = slugify(meta.name) + "-" + Date.now();
       meta.id = null; // Send null to RPC for new items
    }
  }

  // 2. Call the RPC to handle the transactional update
  const { error } = await supabase.rpc("update_full_product_stack", {
    p_group_id: Number(groupId),
    p_brand_id: Number(brandId),
    p_category_id: Number(categoryId),
    p_products: productsMeta
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  return { success: "Product family updated successfully!" };
}