"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

// Helper: Extract storage path from public URL
function getStoragePath(fullUrl: string): string | null {
  if (!fullUrl) return null;
  const match = fullUrl.match(/\/product-images\/(.+)$/);
  return match ? match[1] : null;
}

export async function deleteProductVariant(productId: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  // 1. Fetch Images to delete later
  const { data: product } = await supabase
    .from("products")
    .select("image_urls")
    .eq("id", productId)
    .single();

  // 2. Database Delete (RPC handles check for existing orders)
  const { error } = await supabase.rpc("delete_product_variant", { p_product_id: productId });
  
  if (error) return { error: error.message };

  // 3. Storage Delete
  if (product?.image_urls && product.image_urls.length > 0) {
    const paths = product.image_urls.map(getStoragePath).filter(Boolean) as string[];
    if (paths.length > 0) await supabase.storage.from("product-images").remove(paths);
  }

  revalidatePath("/admin/products");
  return { success: "Product variant deleted successfully." };
}

export async function updateProductFamily(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const groupId = formData.get("group_id");
  const brandId = formData.get("brand_id");
  const categoryId = formData.get("category_id");
  const productsMeta = JSON.parse(formData.get("products_meta") as string);

  // --- STEP 1: Handle Image Deletions (Cleanup removed images) ---
  // Get IDs of existing products being updated
  const existingIds = productsMeta
    .filter((p: any) => p.id && !String(p.id).startsWith("temp-"))
    .map((p: any) => p.id);

  if (existingIds.length > 0) {
    const { data: oldProducts } = await supabase
      .from("products")
      .select("id, image_urls")
      .in("id", existingIds);

    const imagesToDelete: string[] = [];

    oldProducts?.forEach((oldP) => {
      const newMeta = productsMeta.find((p: any) => p.id === oldP.id);
      if (newMeta && oldP.image_urls) {
        // Find URLs present in DB but missing in the 'existing_images' array sent from client
        const keptUrls = new Set(newMeta.existing_images || []);
        oldP.image_urls.forEach((url: string) => {
          if (!keptUrls.has(url)) {
            const path = getStoragePath(url);
            if (path) imagesToDelete.push(path);
          }
        });
      }
    });

    if (imagesToDelete.length > 0) {
      await supabase.storage.from("product-images").remove(imagesToDelete);
    }
  }

  // --- STEP 2: Handle New Image Uploads & Slug Generation ---
  for (let i = 0; i < productsMeta.length; i++) {
    const meta = productsMeta[i];
    let finalImageUrls = meta.existing_images || []; // Start with what the user kept

    // Upload New Files
    const imageCount = meta.new_image_count || 0;
    for (let j = 0; j < imageCount; j++) {
      const file = formData.get(`product_${i}_new_image_${j}`) as File;
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${i}-${j}-${file.name.replace(/\s+/g, '-')}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(fileName, file);
        if (!upErr) {
           const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
           finalImageUrls.push(data.publicUrl);
        }
      }
    }
    meta.image_urls = finalImageUrls;
    
    // Generate Slugs/IDs
    if (String(meta.id).startsWith("temp-") || !meta.slug) {
       meta.slug = slugify(meta.name) + "-" + Date.now();
    }
    if (String(meta.id).startsWith("temp-")) {
       meta.id = null; // Prepare for SQL Insert
    }
  }

  // --- STEP 3: Database Update (RPC) ---
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