"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Helper: Ensure user is active before allowing actions
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

// 1. Add to Cart
export async function addToCart(productId: number, quantity: number = 1) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to add to cart." };
  }
  
  if (!(await validateUser(supabase, user.id))) {
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
      // UPDATE: Add to existing quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);

      if (error) throw error;

    } else {
      // INSERT: New item
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
    revalidatePath("/"); // Update header badge
    return { success: "Added to cart" };

  } catch (error: any) {
    return { error: `Database error: ${error.message}` };
  }
}

// 2. Remove Item
export async function removeItem(productId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in." };
  if (!(await validateUser(supabase, user.id))) redirect("/auth/signout");

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/cart");
  revalidatePath("/"); 
  return { success: "Item removed." };
}

// 3. Update Quantity
export async function updateQuantity(productId: number, newQuantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in." };
  if (!(await validateUser(supabase, user.id))) redirect("/auth/signout");

  if (newQuantity <= 0) {
    return await removeItem(productId);
  }

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

// 4. Place Order (Transaction)
export async function placeOrder() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Validate Active Status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", user.id)
    .single();
  
  if (profile && profile.is_active === false) {
    redirect("/auth/signout");
  }

  try {
    // 1. Call RPC (Returns numeric ID)
    const { data: numericId, error } = await supabase
      .rpc("place_order", { p_user_id: user.id });

    if (error) throw error;

    // 2. Fetch the 'order_number' string for redirection
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("order_number")
      .eq("id", numericId)
      .single();

    if (fetchError) throw fetchError;

    // 3. Clear Caches
    revalidatePath("/cart");   
    revalidatePath("/orders"); 
    revalidatePath("/");       

    // 4. Return the STRING ID (e.g., "ORD-8921")
    return { success: true, orderId: orderData.order_number };

  } catch (error: any) {
    console.error("Order Failed:", error);
    return { error: error.message || "Failed to place order." };
  }
}