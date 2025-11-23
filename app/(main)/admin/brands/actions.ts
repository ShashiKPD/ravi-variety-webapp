"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function addBrands(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return { error: "Forbidden" };
  }

  const brandNames = formData.getAll("brand_name") as string[];

  const brandsToInsert = brandNames
    .map(name => name.trim())
    .filter(name => name.length > 0)
    .map(name => ({ 
      name: name,
      slug: generateSlug(name)
    }));

  if (brandsToInsert.length === 0) {
    return { error: "No brand names provided." };
  }

  const { error } = await supabase.from("brands").insert(brandsToInsert);

  if (error) {
    if (error.code === '23505') {
      return { error: "Error: Brand already exists." };
    }
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/admin/products/new");
  revalidatePath("/admin/brands/new");

  return { success: `${brandsToInsert.length} brands added successfully!` };
}