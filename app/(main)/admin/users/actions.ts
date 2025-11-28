"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserProfile(formData: FormData) {
  const supabase = await createServerClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Extract Data
  const userId = formData.get("id") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address_text") as string;
  
  // Handle Numbers (Lat/Lng) - convert empty strings to null
  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const latitude = latStr ? parseFloat(latStr) : null;
  const longitude = lngStr ? parseFloat(lngStr) : null;

  // 3. Update Database
  // We strictly update the public.profiles table
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role: role,
      phone: phone,
      address_text: address,
      latitude: latitude,
      longitude: longitude,
      // Note: We usually don't update email here to avoid sync issues with Auth
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  // 4. Revalidate & Redirect
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  
  return { success: "User updated successfully" };
}

export async function deleteUser(userId: string) {
  // 1. Auth Check (Same as before)
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: "Unauthorized: Only admins can delete users." };
  }

  // 2. Admin Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 3. Delete
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Delete User Error:", error);
    
    // Custom error messages for common DB constraints
    if (error.message.includes("violates foreign key constraint")) {
      return { error: "Cannot delete user: They have existing orders or data linked to their account." };
    }
    
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  // 1. Auth Check (Is caller Admin?)
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    return { error: "Unauthorized" };
  }

  // 2. Initialize Service Role Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const newStatus = !currentStatus; // Toggle

  try {
    // 3. Update Auth Layer (The actual security block)
    // If disabling (newStatus = false), ban for 100 years. 
    // If enabling, set ban duration to 0 (unban).
    const banDuration = newStatus ? "0" : "876000h"; 
    
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId, 
      { ban_duration: banDuration }
    );

    if (authError) throw authError;

    // 4. Update Profile Layer (For UI display)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: newStatus })
      .eq("id", userId);

    if (profileError) throw profileError;

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}