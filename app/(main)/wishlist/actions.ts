"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// This Server Action will be called by our button
export async function toggleWishlistItem(productId: number) {
  const supabase = await createClient();

  // 1. Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add to wishlist." };
  }

  // 2. Check if the item is ALREADY in the wishlist
  const { data: existingItem, error: fetchError } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is 'No rows found', which is not an error here
    console.error("Error checking wishlist:", fetchError);
    return { error: fetchError.message };
  }

  try {
    if (existingItem) {
      // 3. If it exists, REMOVE it
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", existingItem.id);

      if (error) throw error;
      revalidatePath("/wishlist"); // Update the wishlist page cache
      return { success: "Removed from wishlist" };

    } else {
      // 4. If it does not exist, ADD it
      const { error } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;
      revalidatePath("/wishlist"); // Update the wishlist page cache
      return { success: "Added to wishlist" };
    }
  } catch (error: any) {
    return { error: `Database error: ${error.message}` };
  }
}