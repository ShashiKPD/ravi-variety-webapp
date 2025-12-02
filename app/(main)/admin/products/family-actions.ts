"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

// 1. DELETE ACTION
export async function deleteProductVariant(productId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify Admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  // Call the RPC
  const { data: message, error } = await supabase.rpc("delete_product_variant", { p_product_id: productId });

  if (error) {
    // Handle Foreign Key violation gracefully if RPC checks miss something
    if (error.code === '23503') return { error: "Cannot delete: Item exists in order history." };
    return { error: error.message };
  }

  // RPC returns a text message on success, or null/error on failure
  revalidatePath("/admin/products");
  return { success: message };
}

// 2. UPDATE FULL FAMILY ACTION
export async function updateProductFamily(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check...
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const groupId = formData.get("group_id");
  const brandId = formData.get("brand_id");
  const categoryId = formData.get("category_id");
  const productsMeta = JSON.parse(formData.get("products_meta") as string);

  // 1. Update Group Metadata
  const { error: groupError } = await supabase
    .from("product_groups")
    .update({ brand_id: Number(brandId), category_id: Number(categoryId) })
    .eq("id", groupId);

  if (groupError) return { error: "Group update failed: " + groupError.message };

  // 2. Process Variants (Upsert)
  for (let i = 0; i < productsMeta.length; i++) {
    const meta = productsMeta[i];
    const variantId = meta.id; // If numeric, it's existing. If string/temp, it's new.
    const isNew = String(variantId).startsWith("temp-");

    // Handle Images
    // Existing images are passed as URLs in 'existing_images'
    // New files are uploaded and added to the list
    let finalImageUrls = meta.existing_images || []; 

    const imageCount = meta.new_image_count || 0;
    for (let j = 0; j < imageCount; j++) {
      const file = formData.get(`product_${i}_new_image_${j}`) as File;
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${i}-${j}-${file.name}`;
        await supabase.storage.from("product-images").upload(fileName, file);
        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        finalImageUrls.push(data.publicUrl);
      }
    }

    const productData = {
      group_id: Number(groupId),
      name: meta.name,
      description: meta.description,
      sku: meta.sku,
      stock_quantity: meta.stock,
      options: meta.options,
      is_featured: meta.is_featured,
      image_urls: finalImageUrls,
      // Only update slug if it's new to avoid breaking SEO links, or if you want to allow slug updates:
      ...(isNew && { slug: slugify(meta.name) + "-" + Date.now() }) 
    };

    let savedProductId = variantId;

    if (isNew) {
      // INSERT
      const { data: newProd, error: insError } = await supabase
        .from("products")
        .insert(productData)
        .select("id")
        .single();
      
      if (insError) return { error: insError.message };
      savedProductId = newProd.id;
    } else {
      // UPDATE
      const { error: updError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", variantId);
      
      if (updError) return { error: updError.message };
    }

    // Update Prices (Helper function logic inlined or reused)
    // We simply upsert prices for this product ID
    const prices = [
      { product_id: savedProductId, role: 'retailer', min_quantity: 1, unit_price: meta.price_retailer, mrp: meta.mrp },
      { product_id: savedProductId, role: 'wholesaler', min_quantity: 1, unit_price: meta.price_wholesaler, mrp: meta.mrp },
      { product_id: savedProductId, role: 'admin', min_quantity: 1, unit_price: meta.price_retailer, mrp: meta.mrp }
    ];

    // We delete old tier 1 prices and re-insert to ensure clean update (simpler than upserting specific rows)
    await supabase.from("price_tiers").delete().eq("product_id", savedProductId).eq("min_quantity", 1);
    await supabase.from("price_tiers").insert(prices);
  }

  revalidatePath("/admin/products");
  return { success: "Product family updated successfully!" };
}