"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper: Extract storage path from full URL
function getStoragePath(fullUrl: string | null): string | null {
  if (!fullUrl) return null;
  const match = fullUrl.match(/\/product-images\/(.+)$/);
  return match ? match[1] : null;
}

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// 1. CREATE
export async function createSupercategory(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  const name = formData.get("name") as string;
  const imageUrl = formData.get("image_url") as string; // Expect URL string

  if (!name) return { error: "Name is required" };

  const { error } = await supabase.from("supercategories").insert({
    name,
    slug: generateSlug(name),
    image_url: imageUrl || null
  });

  if (error) return { error: error.message };
  
  revalidatePath("/admin/supercategories/new");
  return { success: "Supercategory created" };
}

// 2. UPDATE
export async function updateSupercategory(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const newImageUrl = formData.get("image_url") as string;

  // 1. Fetch current data to see if we need to cleanup old image
  const { data: currentItem } = await supabase
    .from("supercategories")
    .select("image_url")
    .eq("id", id)
    .single();

  const updates: any = { name, slug: generateSlug(name) };

  // If NEW image provided, update DB and delete OLD image
  if (newImageUrl) {
    updates.image_url = newImageUrl;

    const oldPath = getStoragePath(currentItem?.image_url);
    if (oldPath) {
      await supabase.storage.from("product-images").remove([oldPath]);
    }
  }

  const { error } = await supabase.from("supercategories").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/supercategories/new");
  return { success: "Updated" };
}

// 3. DELETE
export async function deleteSupercategory(id: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  // 1. Check Dependencies (Categories using this Supercategory)
  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("supercategory_id", id);
    
  if (count && count > 0) return { error: `Cannot delete: Used by ${count} categories.` };

  // 2. Fetch image URL before delete
  const { data: item } = await supabase
    .from("supercategories")
    .select("image_url")
    .eq("id", id)
    .single();

  // 3. Delete Row
  const { error } = await supabase.from("supercategories").delete().eq("id", id);
  if (error) return { error: error.message };

  // 4. Cleanup Image
  const storagePath = getStoragePath(item?.image_url);
  if (storagePath) {
    await supabase.storage.from("product-images").remove([storagePath]);
  }

  revalidatePath("/admin/supercategories/new");
  return { success: "Deleted" };
}