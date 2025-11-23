import { createClient } from "@/utils/supabase/server";
import Header from "./components/Header"; // This component will no longer get 'categories'

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
  let userProfile: { role: string | null; full_name: string | null } = {
    role: null,
    full_name: "Guest",
  };

  if (user) {
    const [cartRes, profileRes] = await Promise.all([
      supabase
        .from("cart_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single(),
    ]);

    cartCount = cartRes.count ?? 0;
    if (profileRes.data) {
      userProfile = profileRes.data;
    }
  }

  return (
    <>
      <Header
        isLoggedIn={!!user}
        userRole={userProfile.role}
        userName={userProfile.full_name}
        cartCount={cartCount}
        // Categories prop is now gone
      />
      
      <main className="bg-gray-100 min-h-screen">
        {children}
      </main>
    </>
  );
}