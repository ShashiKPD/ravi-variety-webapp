import { Suspense } from "react";
import Header from "./Header"; 
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/get-user-profile"; // Import the cached util

async function HeaderDataLoader() {
  const supabase = await createClient();
  
  // ✅ 1. Use the Cached User (Fast, no duplicate auth call)
  const { user, role } = await getCurrentUser();

  let cartCount = 0;
  let userAvatar = null;
  let userName = null;

  if (user) {
    // ✅ 2. Parallelize the rest
    const [cartRes, profileRes] = await Promise.all([
      supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      // We might need avatar/name if it's not in the cached 'role' util.
      // Ideally, add avatar/name to getCurrentUser() if used globally.
      supabase.from("profiles").select("avatar_url, full_name").eq("id", user.id).single()
    ]);

    cartCount = cartRes.count || 0;
    if (profileRes.data) {
      userAvatar = profileRes.data.avatar_url;
      userName = profileRes.data.full_name;
    }
  }

  return (
    <Header 
      userRole={role} // Use the role from the util
      cartCount={cartCount} 
      userAvatar={userAvatar}
      userName={userName}
    />
  );
}

export default function HeaderWrapper() {
  return (
    <Suspense fallback={<div className="h-16 w-full bg-white border-b" />}>
      <HeaderDataLoader />
    </Suspense>
  );
}