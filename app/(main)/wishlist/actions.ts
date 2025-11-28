"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleWishlistItem(productId: number) {
  const supabase = await createClient();

  // 1. Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to manage your wishlist." };
  }

  // 2. Check if the item is ALREADY in the wishlist
  const { data: existingItem, error: fetchError } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is 'No rows found', which is expected for new items
    console.error("Error checking wishlist:", fetchError);
    return { error: fetchError.message };
  }

  try {
    if (existingItem) {
      // 3. REMOVE
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", existingItem.id);

      if (error) throw error;

      // Revalidate to update UI
      revalidatePath("/wishlist");
      revalidatePath("/"); // Update heart icons on homepage
      revalidatePath("/p/[slug]/[id]", 'page'); // Update product pages
      
      return { success: "Removed from wishlist", isWishlisted: false };

    } else {
      // 4. ADD
      const { error } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      revalidatePath("/wishlist");
      revalidatePath("/");
      revalidatePath("/p/[slug]/[id]", 'page');

      return { success: "Added to wishlist", isWishlisted: true };
    }
  } catch (error: any) {
    return { error: `Database error: ${error.message}` };
  }
}