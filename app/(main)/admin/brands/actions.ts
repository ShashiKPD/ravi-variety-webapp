"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// Helper to upload file
async function uploadImage(file: File, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw new Error("Image upload failed: " + error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

// 1. CREATE
export async function createBrand(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File;

  if (!name) return { error: "Name is required" };

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    const path = `brands/${Date.now()}-${imageFile.name}`;
    imageUrl = await uploadImage(imageFile, path);
  }

  const { error } = await supabase.from("brands").insert({
    name,
    slug: generateSlug(name),
    image_url: imageUrl
  });

  if (error) return { error: error.message };
  
  revalidatePath("/admin/brands/new");
  return { success: "Brand created" };
}

// 2. UPDATE
export async function updateBrand(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File;

  const updates: any = { name, slug: generateSlug(name) };

  if (imageFile && imageFile.size > 0) {
    const path = `brands/${Date.now()}-${imageFile.name}`;
    updates.image_url = await uploadImage(imageFile, path);
  }

  const { error } = await supabase.from("brands").update(updates).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/brands/new");
  return { success: "Brand updated" };
}

// 3. DELETE
export async function deleteBrand(id: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Check if Brand is in use
  const { count, error: countError } = await supabase
    .from("product_groups")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id);

  if (countError) return { error: countError.message };
  
  if (count && count > 0) {
    return { error: `Cannot delete: This brand is used by ${count} product families.` };
  }

  // 2. Proceed with Delete
  const { error } = await supabase.from("brands").delete().eq("id", id);
  
  if (error) return { error: error.message };
  
  revalidatePath("/admin/brands/new");
  return { success: "Brand deleted" };
}