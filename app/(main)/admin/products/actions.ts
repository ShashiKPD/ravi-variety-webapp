"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper to slugify
const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

export async function createProductStack(formData: FormData) {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Base Group Data
  const brand_id = formData.get("brand_id");
  const category_id = formData.get("category_id");

  // 3. Parse the "Products" List
  // The frontend will send a JSON array describing the text fields for each product
  const productsMeta = JSON.parse(formData.get("products_meta") as string);
  
  const productsPayload = [];

  // 4. Loop through inputs to handle files
  for (let i = 0; i < productsMeta.length; i++) {
    const meta = productsMeta[i];
    const uploadedUrls: string[] = [];

    // Upload Images for this specific product index
    // Frontend must append files as: `product_0_image_0`, `product_0_image_1`...
    // We'll look for up to 5 images
    for (let j = 0; j < 5; j++) {
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
      slug: slugify(meta.name) + "-" + Date.now(), // Ensure uniqueness
      description: meta.description,
      sku: meta.sku,
      stock: meta.stock,
      mrp: meta.mrp,
      price_retailer: meta.price_retailer,
      price_wholesaler: meta.price_wholesaler,
      options: meta.options, // e.g. {size: "1kg"}
      images: uploadedUrls
    });
  }

  // 5. Call RPC
  const { error } = await supabase.rpc("create_full_product_stack", {
    p_brand_id: Number(brand_id),
    p_category_id: Number(category_id),
    p_products: productsPayload
  });

  if (error) {
    console.error(error);
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: "Products created successfully!" };
}