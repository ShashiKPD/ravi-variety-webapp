"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

export async function createProductStack(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Detect Mode
  const mode = formData.get("mode"); // 'new' or 'existing'
  const group_id = formData.get("group_id"); // Only present if mode === 'existing'
  const brand_id = formData.get("brand_id");
  const category_id = formData.get("category_id");

  const productsMeta = JSON.parse(formData.get("products_meta") as string);
  const productsPayload = [];

  // 2. Process Files & Meta (Same for both modes)
  for (let i = 0; i < productsMeta.length; i++) {
    const meta = productsMeta[i];
    const uploadedUrls: string[] = [];
    const imageCount = meta.image_count || 0;

    for (let j = 0; j < imageCount; j++) {
      const file = formData.get(`product_${i}_image_${j}`) as File;
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${i}-${j}-${file.name}`;
        await supabase.storage.from("product-images").upload(fileName, file);
        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
    }

    productsPayload.push({
      name: meta.name,
      slug: slugify(meta.name) + "-" + Date.now(),
      description: meta.description,
      sku: meta.sku,
      stock: meta.stock,
      mrp: meta.mrp,
      price_retailer: meta.price_retailer,
      price_wholesaler: meta.price_wholesaler,
      is_featured: meta.is_featured,
      options: meta.options,
      unit_id: meta.unit_id,
      images: uploadedUrls
    });
  }

  // 3. Branch Logic
  let error;
  
  if (mode === 'existing' && group_id) {
    // call NEW RPC
    const res = await supabase.rpc("add_variants_to_existing_group", {
      p_group_id: Number(group_id),
      p_products: productsPayload
    });
    error = res.error;
  } else {
    // call OLD RPC
    const res = await supabase.rpc("create_full_product_stack", {
      p_brand_id: Number(brand_id),
      p_category_id: Number(category_id),
      p_products: productsPayload
    });
    error = res.error;
  }

  if (error) {
    console.error(error);
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: mode === 'existing' ? "Variants added successfully!" : "Product family created successfully!" };
}

export async function updateProductQuick(formData: FormData) {
  const supabase = await createClient();
  const productId = formData.get("product_id") as string;
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  
  const pData = {
    mrp: formData.get("mrp"),
    price_retailer: formData.get("price_retailer"),
    price_wholesaler: formData.get("price_wholesaler"),
    bulk_tiers: JSON.parse(formData.get("bulk_tiers") as string || "[]")
  };

  // 1. Update Core Fields
  const { error: updError } = await supabase
    .from("products")
    .update({
      name: formData.get("name"),
      sku: formData.get("sku"),
      stock_quantity: Number(formData.get("stock")),
      is_featured: formData.get("is_featured") === "on"
    })
    .eq("id", productId);

  if (updError) return { error: updError.message };

  // 2. Update Prices (Clear & Re-insert)
  // We can use the helper function directly via RPC
  await supabase.from("price_tiers").delete().eq("product_id", productId);
  
  const { error: rpcError } = await supabase.rpc("insert_variant_prices", {
    p_variant_id: Number(productId),
    p_data: pData
  });

  if (rpcError) return { error: rpcError.message };

  revalidatePath("/admin/products");
  return { success: "Updated" };
}