import Header from "./components/Header";
import MobileBottomNav from "./components/MobileBottomNav"; 
import { createClient } from "@/utils/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  let cartCount = 0;
  let userRole = "anon";
  let userAvatar: string | null = null;
  let userName: string | null = null;

  if (user) {
    // Optimization: Fetched avatar and name in the same parallel request
    const [cartRes, profileRes] = await Promise.all([
      supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("profiles").select("role, avatar_url, full_name").eq("id", user.id).single()
    ]);
    
    cartCount = cartRes.count || 0;
    
    if (profileRes.data) {
        userRole = profileRes.data.role;
        userAvatar = profileRes.data.avatar_url;
        userName = profileRes.data.full_name;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* 1. Sticky Header with Avatar Data */}
      <Header 
        userRole={userRole} 
        cartCount={cartCount} 
        userAvatar={userAvatar}
        userName={userName}
      />

      {/* 2. Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500 hidden md:block">
        <p>© 2025 Ravi Variety. All rights reserved.</p>
      </footer>

      {/* 4. Mobile Bottom Nav */}
      <MobileBottomNav cartCount={cartCount} />
      
    </div>
  );
}