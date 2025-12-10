"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertSale(formData: FormData) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const id = formData.get("id");
  const name = formData.get("name") as string;
  const startAt = formData.get("start_at") as string;
  const endAt = formData.get("end_at") as string;
  
  // Checkboxes return 'on' if checked, null otherwise
  const isActive = formData.get("is_active") === "on";
  
  // Build roles array
  const roles = [];
  if (formData.get("role_retailer") === "on") roles.push("retailer");
  if (formData.get("role_wholesaler") === "on") roles.push("wholesaler");

  const payload = {
    name,
    start_at: startAt, // Ensure your input sends valid ISO-ish string (YYYY-MM-DDTHH:mm)
    end_at: endAt,
    is_active: isActive,
    applicable_roles: roles,
  };

  let error;
  
  if (id) {
    // Update
    const res = await supabase.from("sales").update(payload).eq("id", id);
    error = res.error;
  } else {
    // Create
    const res = await supabase.from("sales").insert(payload);
    error = res.error;
  }

  if (error) return { error: error.message };

  revalidatePath("/admin/sales");
  return { success: "Campaign saved successfully" };
}

export async function deleteSale(id: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("sales").delete().eq("id", id);
  
  if (error) return { error: error.message };
  
  revalidatePath("/admin/sales");
  return { success: "Campaign deleted" };
}