"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper to make a slug (e.g. "Mango Pickle" -> "mango-pickle")
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with -
    .replace(/^-+|-+$/g, ""); // Trim - from start/end
}

export async function addCategories(formData: FormData) {
  const supabase = await createClient();

  // 1. Check for admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return { error: "Forbidden: You must be an admin." };
  }

  // 2. Get names
  const categoryNames = formData.getAll("category_name") as string[];

  // 3. Format data with SLUGS
  const categoriesToInsert = categoryNames
    .map(name => name.trim())
    .filter(name => name.length > 0)
    .map(name => ({ 
      name: name,
      slug: generateSlug(name) // <--- THIS FIXES YOUR ERROR
    }));

  if (categoriesToInsert.length === 0) {
    return { error: "All category names were empty." };
  }

  // 4. Insert
  const { error } = await supabase.from("categories").insert(categoriesToInsert);

  if (error) {
    if (error.code === '23505') {
      return { error: "Error: One or more categories (or their slugs) already exist." };
    }
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin/categories/new");
  revalidatePath("/admin/products/new");

  return { success: `${categoriesToInsert.length} categories added successfully!` };
}