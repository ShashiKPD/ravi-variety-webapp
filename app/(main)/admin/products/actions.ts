"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper for slug generation
const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

type RowUpdate = {
  id: number;
  changes: {
    stock?: number;
    price_retailer?: number;   // Renamed
    price_wholesaler?: number; // Added
    saleId?: number | null; // Null means remove from sale
    discountType?: "percentage" | "fixed_price";
    discountValue?: number;
    isFeatured?: boolean; // NEW
  };
};

type BulkUpdatePayload = {
  scope: "selection" | "all_matching";
  selectedIds?: number[];
  filterParams?: any; 
  changes: {
    stock?: number;
    price_retailer?: number;   // Renamed
    price_wholesaler?: number; // Added
    saleId?: number;
    discountType?: "percentage" | "fixed_price"; // <--- UPDATED to match DB constraint
    discountValue?: number;
    isFeatured?: boolean; // NEW
  };
};

// 1. CREATE PRODUCT STACK
export async function createProductStack(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const brandId = formData.get("brand_id");
  const categoryId = formData.get("category_id");
  const productsMeta = JSON.parse(formData.get("products_meta") as string);

  // 1. Upload Images & Prepare Meta
  // We must handle file uploads here in Node.js before calling the DB
  for (let i = 0; i < productsMeta.length; i++) {
    const meta = productsMeta[i];
    const imageUrls: string[] = [];

    // Loop through possible image indices (0 to image_count)
    const count = meta.image_count || 0;
    for (let j = 0; j < count; j++) {
      const file = formData.get(`product_${i}_image_${j}`) as File;
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${i}-${j}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (!uploadError) {
          const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);
          imageUrls.push(data.publicUrl);
        }
      }
    }

    // Attach processed data to meta object
    meta.image_urls = imageUrls;
    meta.slug = slugify(meta.name) + "-" + Date.now(); // Ensure unique slug
    
    // Ensure pack_size is an integer (frontend sends string)
    meta.pack_size = meta.pack_size ? Number(meta.pack_size) : 1;
  }

  // 2. Call RPC
  // The RPC 'create_full_product_stack' now accepts pack_size and barcode
  const { data: groupId, error } = await supabase.rpc("create_full_product_stack", {
    p_brand_id: Number(brandId),
    p_category_id: Number(categoryId),
    p_products: productsMeta
  });

  if (error) {
    console.error("RPC Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: "Product family created successfully!" };
}

// 2. UPDATE QUICK EDIT (Ensure this handles new fields too)
export async function updateProductQuick(formData: FormData) {
  const supabase = await createClient();
  const productId = formData.get("product_id");
  
  // Prepare Data for RPC helper 'insert_variant_prices'
  const pData = {
    mrp: formData.get("mrp"),
    price_retailer: formData.get("price_retailer"),
    price_wholesaler: formData.get("price_wholesaler"),
    bulk_tiers: JSON.parse(formData.get("bulk_tiers") as string || "[]")
  };

  // Update Core Fields including PACK_SIZE and BARCODE
  const { error: updError } = await supabase
    .from("products")
    .update({
      name: formData.get("name"),
      sku: formData.get("sku"),
      stock_quantity: Number(formData.get("stock")),
      is_featured: formData.get("is_featured") === "on",
      pack_size: Number(formData.get("pack_size")) || 1, // <--- Added
      barcode: formData.get("barcode") // <--- Added
    })
    .eq("id", productId);

  if (updError) return { error: updError.message };

  // Update Prices
  await supabase.from("price_tiers").delete().eq("product_id", productId);
  
  const { error: rpcError } = await supabase.rpc("insert_variant_prices", {
    p_variant_id: Number(productId),
    p_data: pData
  });

  if (rpcError) return { error: rpcError.message };

  revalidatePath("/admin/products");
  return { success: "Updated successfully" };
}

export async function updateInventoryRows(updates: RowUpdate[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const promises = updates.map(async (row) => {
      const { id, changes } = row;

      // Update Products Table (Stock & Featured)
      const productUpdates: any = {};
      if (changes.stock !== undefined) productUpdates.stock_quantity = changes.stock;
      if (changes.isFeatured !== undefined) productUpdates.is_featured = changes.isFeatured;
      
      if (Object.keys(productUpdates).length > 0) {
        await supabase.from("products").update(productUpdates).eq("id", id);
      }

      // Update Retailer Price
      if (changes.price_retailer !== undefined) {
        await supabase.from("price_tiers").upsert({
          product_id: id, role: "retailer", min_quantity: 1, unit_price: changes.price_retailer
        }, { onConflict: "product_id, role, min_quantity" });
      }

      // Update Wholesaler Price
      if (changes.price_wholesaler !== undefined) {
        await supabase.from("price_tiers").upsert({
          product_id: id, role: "wholesaler", min_quantity: 1, unit_price: changes.price_wholesaler
        }, { onConflict: "product_id, role, min_quantity" });
      }

      // Update Sale
      if (changes.saleId !== undefined) {
        if (changes.saleId === null) {
          await supabase.from("sale_items").delete().eq("product_id", id);
        } else if (changes.discountValue !== undefined && changes.discountType) {
          await supabase.from("sale_items").delete().eq("product_id", id);
          await supabase.from("sale_items").insert({
            sale_id: changes.saleId, product_id: id,
            discount_type: changes.discountType, discount_value: changes.discountValue
          });
        }
      }
    });

    await Promise.all(promises);
    revalidatePath("/admin/products");
    return { success: true, count: updates.length };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function bulkUpdateInventory(payload: BulkUpdatePayload) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    let targetIds: number[] = [];
    if (payload.scope === "selection") {
      targetIds = payload.selectedIds || [];
    } else {
      const { data: searchResults } = await supabase.rpc("search_products", {
        ...payload.filterParams, p_page: 1, p_limit: 10000
      });
      targetIds = searchResults.map((p: any) => p.id);
    }

    if (targetIds.length === 0) return { success: true, count: 0 };

    // Updated RPC Call
    const { error: updateError } = await supabase.rpc("batch_update_inventory", {
      p_product_ids: targetIds,
      p_stock: payload.changes.stock ?? null,
      p_price_retailer: payload.changes.price_retailer ?? null,     
      p_price_wholesaler: payload.changes.price_wholesaler ?? null, 
      p_sale_id: payload.changes.saleId ?? null,
      p_discount_type: payload.changes.discountType ?? null,
      p_discount_value: payload.changes.discountValue ?? null,
      p_is_featured: payload.changes.isFeatured ?? null // NEW
    });

    if (updateError) throw updateError;
    revalidatePath("/admin/products");
    return { success: true, count: targetIds.length };
  } catch (error: any) {
    return { error: error.message || "Update failed" };
  }
}

export async function getActiveSales() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_active_sales_options");
  if (error) return [];
  return data;
}