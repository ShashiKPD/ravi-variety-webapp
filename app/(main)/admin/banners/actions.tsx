"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadBanner(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  const file = formData.get("image") as File;
  const title = formData.get("title") as string;
  
  if (!file || file.size === 0) return { error: "No file provided" };

  // Upload
  const path = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("banners").upload(path, file);
  
  if (uploadError) return { error: uploadError.message };
  
  const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);

  // Insert Record
  const { error: dbError } = await supabase.from("banners").insert({
    image_url: urlData.publicUrl,
    title: title || "",
    sort_order: 0 // Default to top for now, or implement drag-sort later
  });

  if (dbError) return { error: dbError.message };

  revalidatePath("/admin/banners"); // Revalidate admin list
  revalidatePath("/"); // Revalidate Homepage
  return { success: "Banner uploaded" };
}

export async function deleteBanner(id: number) {
  const supabase = await createClient();
  // ... Auth Check (Same as above) ...
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  // Ideally we should delete from storage too, but for MVP just DB row is fine
  const { error } = await supabase.from("banners").delete().eq("id", id);
  
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Banner deleted" };
}