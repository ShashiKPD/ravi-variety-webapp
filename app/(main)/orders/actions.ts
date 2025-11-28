"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelUserOrder(orderId: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify ownership before calling RPC (Double safety)
  const { data: order } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    return { error: "Order not found" };
  }

  const { error } = await supabase.rpc("cancel_order", { p_order_id: orderId });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  return { success: "Order cancelled successfully" };
}