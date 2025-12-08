"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAppSetting(formData: FormData) {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') return { error: "Forbidden" };

  // 2. Extract Data
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  if (!key || !value) return { error: "Missing fields" };

  // 3. Update
  const { error } = await supabase
    .from("app_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/"); // Clear homepage cache too since New Arrivals depends on this
  return { success: "Setting updated" };
}