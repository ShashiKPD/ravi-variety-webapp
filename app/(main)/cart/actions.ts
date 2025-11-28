"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function validateUser(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .single();
  
  if (profile && profile.is_active === false) {
    return false;
  }
  return true;
}
// This Server Action will be called by our button
export async function addToCart(productId: number, quantity: number = 1) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add to cart." };
  }
  // Check Status
  const isValid = await validateUser(supabase, user.id);
  if (!isValid) {
    redirect("/auth/signout"); 
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

  if (!(await validateUser(supabase, user.id))) {
    redirect("/auth/signout");
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
  if (!(await validateUser(supabase, user.id))) {
    redirect("/auth/signout");
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

export async function submitOrder() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (!(await validateUser(supabase, user.id))) {
    redirect("/auth/signout");
  }

  try {
    // Call the Transactional RPC
    const { data: orderId, error } = await supabase
      .rpc("place_order", { p_user_id: user.id });

    if (error) throw error;

    // Redirect to the new Order Details page
    // We use redirect() outside the try/catch block usually, 
    // but inside an action it throws an error that Next.js catches. 
    // So we return the ID and let the Client Component handle the redirect 
    // OR we just redirect here if we are in a <form> context.
    return { success: true, orderId };

  } catch (error: any) {
    console.error("Order Failed:", error);
    return { error: error.message || "Failed to place order." };
  }
}