"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uploadImage(file: File, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw new Error("Image upload failed: " + error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createSupercategory(formData: FormData) {
  const supabase = await createClient();
  // ... Auth Check (Admin) ...
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File;

  if (!name) return { error: "Name is required" };

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    const path = `supercategories/${Date.now()}-${imageFile.name}`;
    imageUrl = await uploadImage(imageFile, path);
  }

  const { error } = await supabase.from("supercategories").insert({
    name,
    slug: generateSlug(name),
    image_url: imageUrl
  });

  if (error) return { error: error.message };
  
  revalidatePath("/admin/supercategories/new");
  return { success: "Supercategory created" };
}

// ... Add updateSupercategory and deleteSupercategory using same pattern ...
// For Delete, check: from("categories").select("id").eq("supercategory_id", id)
export async function deleteSupercategory(id: number) {
    const supabase = await createClient();
    // ... Auth Check ...
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'admin') return { error: "Forbidden" };

    const { count } = await supabase.from("categories").select("id", { count: "exact", head: true }).eq("supercategory_id", id);
    if (count && count > 0) return { error: `Cannot delete: Used by ${count} categories.` };

    const { error } = await supabase.from("supercategories").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/supercategories/new");
    return { success: "Deleted" };
}

export async function updateSupercategory(formData: FormData) {
    const supabase = await createClient();
    // ... Auth Check ...
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'admin') return { error: "Forbidden" };

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File;
    const updates: any = { name, slug: generateSlug(name) };

    if (imageFile && imageFile.size > 0) {
        const path = `supercategories/${Date.now()}-${imageFile.name}`;
        updates.image_url = await uploadImage(imageFile, path);
    }

    const { error } = await supabase.from("supercategories").update(updates).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/supercategories/new");
    return { success: "Updated" };
}