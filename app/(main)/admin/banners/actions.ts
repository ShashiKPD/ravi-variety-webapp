"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper: Extract storage path from public URL
function getStoragePath(fullUrl: string): string | null {
  const match = fullUrl.match(/\/banners\/(.+)$/);
  return match ? match[1] : null;
}

// 1. CREATE (Expects URL from Client)
export async function createBanner(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  const imageUrl = formData.get("image_url") as string;
  const title = formData.get("title") as string;
  
  if (!imageUrl) return { error: "No image provided" };

  // Get max sort order to append to end
  const { data: maxOrder } = await supabase.from("banners").select("sort_order").order("sort_order", { ascending: false }).limit(1).single();
  const nextOrder = (maxOrder?.sort_order || 0) + 1;

  const { error } = await supabase.from("banners").insert({
    image_url: imageUrl,
    title: title || "",
    sort_order: nextOrder
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Banner added" };
}

// 2. DELETE (Cleans up Storage)
export async function deleteBanner(id: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Unauthorized" };

  // 1. Fetch Image URL
  const { data: banner } = await supabase.from("banners").select("image_url").eq("id", id).single();

  // 2. Delete Row
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };

  // 3. Delete from Storage (Fire and forget, don't block if it fails)
  if (banner?.image_url) {
    const path = getStoragePath(banner.image_url);
    if (path) {
      await supabase.storage.from("banners").remove([path]);
    }
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Banner deleted" };
}

// 3. REORDER
export async function reorderBanners(items: { id: number; sort_order: number; image_url: string; title: string | null }[]) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { error } = await supabase
    .from("banners")
    .upsert(items, { onConflict: 'id' });

  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Order updated" };
}