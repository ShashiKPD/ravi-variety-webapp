"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

// Helper to extract file path from public URL
function getStoragePath(fullUrl: string): string | null {
  if (!fullUrl) return null;
  const match = fullUrl.match(/\/product-images\/(.+)$/);
  return match ? match[1] : null;
}

// 1. DELETE ACTION (Now cleans up storage)
export async function deleteProductVariant(productId: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  // --- STEP 1: Fetch Images before deleting ---
  const { data: product } = await supabase
    .from("products")
    .select("image_urls")
    .eq("id", productId)
    .single();

  // --- STEP 2: Delete from DB ---
  const { data: message, error } = await supabase.rpc("delete_product_variant", { p_product_id: productId });

  if (error) {
    if (error.code === '23503') return { error: "Cannot delete: Item exists in order history." };
    return { error: error.message };
  }

  // --- STEP 3: Delete from Storage (Fire & Forget) ---
  if (product?.image_urls && product.image_urls.length > 0) {
    const pathsToDelete = product.image_urls
      .map((url: string) => getStoragePath(url))
      .filter((path: string | null) => path !== null) as string[];

    if (pathsToDelete.length > 0) {
      await supabase.storage.from("product-images").remove(pathsToDelete);
    }
  }

  revalidatePath("/admin/products");
  return { success: message };
}

// 2. UPDATE FULL FAMILY ACTION (Fixes Slug Crash)
export async function updateProductFamily(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const groupId = formData.get("group_id");
  const brandId = formData.get("brand_id");
  const categoryId = formData.get("category_id");
  const productsMeta = JSON.parse(formData.get("products_meta") as string);

  // 1. Process Images & Slugs
  for (let i = 0; i < productsMeta.length; i++) {
    const meta = productsMeta[i];
    let finalImageUrls = meta.existing_images || []; 

    // Handle File Uploads
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
    meta.image_urls = finalImageUrls;
    
    // --- FIX: Ensure Slug Exists for EVERY item ---
    // If it's new (temp ID) OR if the existing slug is somehow missing/empty
    if (String(meta.id).startsWith("temp-") || !meta.slug) {
       meta.slug = slugify(meta.name) + "-" + Date.now();
    }

    // Prepare ID for RPC (Null for new items triggers INSERT)
    if (String(meta.id).startsWith("temp-")) {
       meta.id = null; 
    }
  }

  // 2. Call RPC
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