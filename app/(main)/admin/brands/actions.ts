"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function getStoragePath(fullUrl: string | null): string | null {
  if (!fullUrl) return null;
  const match = fullUrl.match(/\/product-images\/(.+)$/);
  return match ? match[1] : null;
}

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createBrand(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const imageUrl = formData.get("image_url") as string;
  const categories = JSON.parse(formData.get("categories") as string || "[]");

  if (!name) return { error: "Name is required" };

  // 1. Create Brand
  const { data: brand, error } = await supabase.from("brands").insert({
    name,
    slug: generateSlug(name),
    image_url: imageUrl || null
  }).select("id").single();

  if (error) return { error: error.message };

  // 2. Link Categories
  if (categories.length > 0) {
    const links = categories.map((catId: number) => ({
      brand_id: brand.id,
      category_id: catId
    }));
    const { error: linkError } = await supabase.from("brand_categories").insert(links);
    if (linkError) console.error("Category link error:", linkError);
  }
  
  revalidatePath("/admin/brands/new");
  return { success: "Brand created" };
}

export async function updateBrand(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const newImageUrl = formData.get("image_url") as string;
  const categories = JSON.parse(formData.get("categories") as string || "[]");

  // 1. Update Core Data
  const { data: currentItem } = await supabase.from("brands").select("image_url").eq("id", id).single();
  const updates: any = { name, slug: generateSlug(name) };

  if (newImageUrl) {
    updates.image_url = newImageUrl;
    // ... delete old image logic ...
  }

  const { error } = await supabase.from("brands").update(updates).eq("id", id);
  if (error) return { error: error.message };

  // 2. Sync Categories (Delete All -> Re-insert)
  // This is simpler/safer than calculating diffs for small lists
  await supabase.from("brand_categories").delete().eq("brand_id", id);
  
  if (categories.length > 0) {
    const links = categories.map((catId: number) => ({
      brand_id: Number(id),
      category_id: catId
    }));
    await supabase.from("brand_categories").insert(links);
  }

  revalidatePath("/admin/brands/new");
  return { success: "Brand updated" };
}

// 3. DELETE
export async function deleteBrand(id: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Check Dependencies (Product Groups using this Brand)
  const { count, error: countError } = await supabase
    .from("product_groups")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id);

  if (countError) return { error: countError.message };
  
  if (count && count > 0) {
    return { error: `Cannot delete: This brand is used by ${count} product families.` };
  }

  // 2. Fetch image URL
  const { data: item } = await supabase
    .from("brands")
    .select("image_url")
    .eq("id", id)
    .single();

  // 3. Delete Row
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { error: error.message };

  // 4. Cleanup Image
  const storagePath = getStoragePath(item?.image_url);
  if (storagePath) {
    await supabase.storage.from("product-images").remove([storagePath]);
  }
  
  revalidatePath("/admin/brands/new");
  return { success: "Brand deleted" };
}

// --- Brand Access Features (Unchanged logic, just keeping them here) ---

export async function toggleBrandRestriction(brandId: number, isRestricted: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  const { error } = await supabase
    .from("brands")
    .update({ is_restricted: isRestricted })
    .eq("id", brandId);

  if (error) return { error: error.message };

  revalidatePath("/admin/brands/new");
  return { success: "Brand updated" };
}

export async function toggleUserBrandAccess(brandId: number, userId: string, grantAccess: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  if (grantAccess) {
    const { error } = await supabase
      .from("brand_access_permissions")
      .insert({ brand_id: brandId, user_id: userId });
    
    if (error && error.code !== '23505') return { error: error.message };
  } else {
    const { error } = await supabase
      .from("brand_access_permissions")
      .delete()
      .match({ brand_id: brandId, user_id: userId });
      
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/brands/${brandId}/access`);
  return { success: "Access updated" };
}