"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper: Extract "categories/filename.jpg" from the full Public URL
function getStoragePath(fullUrl: string | null): string | null {
  if (!fullUrl) return null;
  // Assuming URL format: .../storage/v1/object/public/product-images/categories/image.jpg
  // We need to match everything AFTER the bucket name "product-images/"
  const match = fullUrl.match(/\/product-images\/(.+)$/);
  return match ? match[1] : null;
}

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// 1. CREATE (Updated: No image cleanup needed here)
export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  const name = formData.get("name") as string;
  const supercategoryIdRaw = formData.get("supercategory_id") as string;
  const imageUrl = formData.get("image_url") as string; 

  if (!name) return { error: "Name is required" };

  const supercategory_id = supercategoryIdRaw ? Number(supercategoryIdRaw) : null;

  const { error } = await supabase.from("categories").insert({
    name,
    slug: generateSlug(name),
    image_url: imageUrl || null,
    supercategory_id: supercategory_id
  });

  if (error) {
    if (error.code === '23505') return { error: "Category already exists." };
    return { error: error.message };
  }
  
  revalidatePath("/admin/categories"); // Correct path
  return { success: "Category created" };
}

// 2. UPDATE (Updated: Deletes OLD image if replaced)
export async function updateCategory(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const supercategoryIdRaw = formData.get("supercategory_id") as string;
  const newImageUrl = formData.get("image_url") as string;

  // 1. Fetch current category to see if we need to cleanup an old image
  const { data: currentCategory } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .single();

  const updates: any = { 
    name, 
    slug: generateSlug(name),
    supercategory_id: supercategoryIdRaw ? Number(supercategoryIdRaw) : null 
  };

  // If a NEW image is provided, we update the DB and delete the OLD one
  if (newImageUrl) {
    updates.image_url = newImageUrl;

    // CLEANUP: If there was an old image, delete it from storage
    const oldPath = getStoragePath(currentCategory?.image_url);
    if (oldPath) {
      await supabase.storage.from("product-images").remove([oldPath]);
    }
  }

  const { error } = await supabase.from("categories").update(updates).eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/categories");
  return { success: "Category updated" };
}

// 3. DELETE (Updated: Deletes image from storage)
export async function deleteCategory(id: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Check dependencies
  const { count, error: countError } = await supabase
    .from("product_groups")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) return { error: countError.message };
  if (count && count > 0) {
    return { error: `Cannot delete: Used by ${count} product families.` };
  }

  // 2. Fetch image URL before deleting
  const { data: category } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .single();

  // 3. Delete Row
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  // 4. CLEANUP: Delete image from storage if exists
  const storagePath = getStoragePath(category?.image_url);
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([storagePath]);
      
    if (storageError) {
      // We don't fail the request here, but we log it.
      // The category is already deleted from DB.
      console.error("Failed to cleanup image:", storageError);
    }
  }
  
  revalidatePath("/admin/categories");
  return { success: "Category deleted" };
}