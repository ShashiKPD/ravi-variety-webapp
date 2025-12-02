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

  // Verify Admin Role
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    return { error: "Unauthorized action." };
  }

  // 2. Extract Data
  const userId = formData.get("id") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string;
  // phone is read-only in UI, usually ignored here or just kept as is
  const address = formData.get("address_text") as string;
  const password = formData.get("password") as string; // <--- NEW FIELD
  
  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const latitude = latStr ? parseFloat(latStr) : null;
  const longitude = lngStr ? parseFloat(lngStr) : null;

  // 3. Initialize Admin Client (Required for Password & Email Auth updates)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // 4. Update Auth Data (Password & Email)
    const authUpdates: { password?: string; email?: string } = {};
    if (password && password.trim().length >= 6) {
      authUpdates.password = password.trim();
    }
    if (email) {
      authUpdates.email = email.trim();
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdates
      );
      if (authError) throw authError;
    }

    // 5. Update Profile Data
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        role: role,
        email: email, // Sync to profile
        address_text: address,
        latitude: latitude,
        longitude: longitude,
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    
    return { success: "User updated successfully" };

  } catch (error: any) {
    return { error: error.message };
  }
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

export async function adminUploadAvatar(formData: FormData) {
  const supabase = await createServerClient();
  
  // 1. Auth Check (Caller must be Admin)
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

  // 2. Extract Data
  const targetUserId = formData.get("target_user_id") as string;
  const file = formData.get("avatar") as File;
  
  if (!file || file.size === 0) return { error: "No file provided" };

  // 3. Upload to Storage
  // We overwrite the previous file or create a new one with a timestamp
  const fileExt = file.name.split(".").pop();
  const filePath = `${targetUserId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) return { error: uploadError.message };

  // 4. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // 5. Update Profile
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", targetUserId);

  if (dbError) return { error: dbError.message };

  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: "Avatar updated", url: publicUrl };
}