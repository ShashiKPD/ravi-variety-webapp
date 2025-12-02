"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addUnit(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const fullName = formData.get("name") as string;
  const shortName = formData.get("short_name") as string;

  if (!fullName || !shortName) return { error: "Both names required" };

  const { error } = await supabase.from("units").insert({
    name: fullName.toUpperCase(),
    short_name: shortName
  });

  if (error) {
    if (error.code === '23505') return { error: "Unit already exists" };
    return { error: error.message };
  }

  revalidatePath("/admin/units/new");
  return { success: "Unit added" };
}

export async function deleteUnit(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check usage
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("unit_id", id);

  if (count && count > 0) {
    return { error: `Cannot delete: Used by ${count} products.` };
  }

  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/units/new");
  return { success: "Unit deleted" };
}