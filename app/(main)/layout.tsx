import Header from "./components/Header";
import MobileBottomNav from "./components/MobileBottomNav"; // Import
import { createClient } from "@/utils/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  // Fetch cart count for the badges
  const { data: { user } } = await supabase.auth.getUser();
  let cartCount = 0;
  let userRole = "anon";

  if (user) {
    const [cartRes, profileRes] = await Promise.all([
      supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("profiles").select("role").eq("id", user.id).single()
    ]);
    cartCount = cartRes.count || 0;
    userRole = profileRes.data?.role || "anon";
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* 1. Sticky Header */}
      <Header userRole={userRole} cartCount={cartCount} />

      {/* 2. Main Content (Added padding-bottom for mobile nav) */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* 3. Footer (Optional: You can hide footer on mobile if it's too much clutter) */}
      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500 hidden md:block">
        <p>© 2025 Ravi Variety. All rights reserved.</p>
      </footer>

      {/* 4. Mobile Bottom Nav (Fixed) */}
      <MobileBottomNav cartCount={cartCount} />
      
    </div>
  );
}