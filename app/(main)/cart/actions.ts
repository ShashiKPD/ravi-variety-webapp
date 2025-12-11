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
    // 1. Call RPC (No arguments - Secure)
    // The RPC returns JSON: { "success": true, "orderId": "ORD-XXXX" }
    const { data, error } = await supabase.rpc("place_order");

    if (error) throw error;

    // Check for logical errors returned by RPC (e.g., "Cart is empty")
    if (data && data.error) {
      throw new Error(data.error);
    }

    // 2. Clear Caches
    revalidatePath("/cart");   
    revalidatePath("/orders"); 
    revalidatePath("/");       

    // 3. Return the Order ID directly
    return { success: true, orderId: data.orderId };

  } catch (error: any) {
    console.error("Order Failed:", error);
    return { error: error.message || "Failed to place order." };
  }
}

export async function bulkSyncCart(items: { productId: number; quantity: number }[]) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please login to checkout" };

  // Prepare JSON for RPC
  const payload = items.map(i => ({
    product_id: i.productId,
    quantity: i.quantity
  }));

  // Call the "Replace" RPC
  const { error } = await supabase.rpc("sync_cart_state", {
    p_items: payload
  });

  if (error) {
    console.error("Cart Sync Error:", error);
    return { error: "Failed to sync cart" };
  }

  revalidatePath("/cart");
  return { success: true };
}