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
export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  // Data Extraction
  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File;
  const supercategoryIdRaw = formData.get("supercategory_id") as string;

  if (!name) return { error: "Name is required" };

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    const path = `categories/${Date.now()}-${imageFile.name}`;
    imageUrl = await uploadImage(imageFile, path);
  }

  // Handle optional supercategory
  const supercategory_id = supercategoryIdRaw ? Number(supercategoryIdRaw) : null;

  const { error } = await supabase.from("categories").insert({
    name,
    slug: generateSlug(name),
    image_url: imageUrl,
    supercategory_id: supercategory_id // <--- NEW FIELD
  });

  if (error) {
    if (error.code === '23505') return { error: "Category already exists." };
    return { error: error.message };
  }
  
  revalidatePath("/admin/categories/new");
  return { success: "Category created" };
}

// 2. UPDATE
export async function updateCategory(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File;
  const supercategoryIdRaw = formData.get("supercategory_id") as string;

  const supercategory_id = supercategoryIdRaw ? Number(supercategoryIdRaw) : null;

  const updates: any = { 
    name, 
    slug: generateSlug(name),
    supercategory_id: supercategory_id // <--- NEW FIELD
  };

  if (imageFile && imageFile.size > 0) {
    const path = `categories/${Date.now()}-${imageFile.name}`;
    updates.image_url = await uploadImage(imageFile, path);
  }

  const { error } = await supabase.from("categories").update(updates).eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/categories/new");
  return { success: "Category updated" };
}

// 3. DELETE
export async function deleteCategory(id: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Check if Category is in use (by Product Groups)
  const { count, error: countError } = await supabase
    .from("product_groups")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return { error: countError.message };
  
  if (count && count > 0) {
    return { error: `Cannot delete: This category is used by ${count} product families.` };
  }

  // 2. Proceed with Delete
  const { error } = await supabase.from("categories").delete().eq("id", id);
  
  if (error) return { error: error.message };
  
  revalidatePath("/admin/categories/new");
  return { success: "Category deleted" };
}