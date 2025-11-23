"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// This Server Action will be called by our button
export async function addToCart(productId: number, quantity: number = 1) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add to cart." };
  }

  const { data: existingItem, error: fetchError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { error: fetchError.message };
  }

  try {
    if (existingItem) {
      // UPDATE: Add the new quantity to the existing quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);

      if (error) throw error;

    } else {
      // INSERT: Use the passed quantity
      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: quantity, 
        });

      if (error) throw error;
    }

    revalidatePath("/cart"); 
    revalidatePath("/"); // Update header cart count
    return { success: "Added to cart" };

  } catch (error: any) {
    return { error: `Database error: ${error.message}` };
  }
}

export async function removeItem(productId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Find and delete the item
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/cart"); // Refresh the cart page data
  revalidatePath("/"); // Refresh the main layout (for the cart count)
  return { success: "Item removed." };
}

export async function updateQuantity(productId: number, newQuantity: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // If quantity is 0, remove the item
  if (newQuantity <= 0) {
    return await removeItem(productId);
  }

  // Otherwise, update the quantity
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: newQuantity })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/cart");
  return { success: "Quantity updated." };
}