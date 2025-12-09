"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Update Profile (Restricted: Email Only)
export async function updateAccountDetails(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const email = formData.get("email") as string;

  // STRICT BUSINESS LOGIC: 
  // Users can ONLY update their email. 
  // Address/Name/Phone are locked to prevent business identity fraud.
  const updates = {
    email, 
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: "Contact details updated" };
}

// 2. Upload Avatar (Allowed)
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "No file provided" };

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (dbError) return { error: dbError.message };

  revalidatePath("/account");
  revalidatePath("/", "layout"); 
  
  return { success: "Profile photo updated", url: publicUrl };
}