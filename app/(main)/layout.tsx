import { createClient } from "@/utils/supabase/server";
import Header from "./components/Header";
import { redirect } from "next/navigation"; // Import redirect

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cartCount = 0;
  let userProfile: { role: string | null; full_name: string | null; avatar_url: string | null; is_active: boolean | null } = {
    role: null,
    full_name: "Guest",
    avatar_url: null,
    is_active: true, // Default to true for guests
  };

  if (user) {
    const [cartRes, profileRes] = await Promise.all([
      supabase
        .from("cart_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("role, full_name, avatar_url, is_active") // Fetch is_active
        .eq("id", user.id)
        .single(),
    ]);

    cartCount = cartRes.count ?? 0;
    if (profileRes.data) {
      userProfile = profileRes.data;
    }

    // --- SECURITY CHECK ---
    // If the account exists but is marked disabled, force logout immediately.
    if (userProfile.is_active === false) {
      redirect("/auth/signout");
    }
  }

  return (
    <>
      <Header
        isLoggedIn={!!user}
        userRole={userProfile.role}
        userName={userProfile.full_name}
        userAvatar={userProfile.avatar_url}
        cartCount={cartCount}
      />
      
      <main className="bg-gray-100 min-h-screen">
        {children}
      </main>
    </>
  );
}