"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Approve Order (Triggers Stock Deduction)
export async function approveOrder(orderId: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Call the Transactional RPC
    const { error } = await supabase.rpc("approve_order", { p_order_id: orderId });
    
    if (error) throw error;

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: "Order approved and stock deducted." };

  } catch (error: any) {
    return { error: error.message || "Failed to approve order." };
  }
}

// 2. Reject Order (No stock change, just status update)
export async function rejectOrder(orderId: number) {
  const supabase = await createClient();
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: "Order rejected." };

  } catch (error: any) {
    return { error: error.message };
  }
}