import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  Heart, 
  Settings, 
  HelpCircle, 
  Bell, 
  User, 
  ChevronRight,
  LogOut 
} from "lucide-react";
import LogoutButton from "../components/LogoutButton";

export default async function AccountHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch basic profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, phone, avatar_url")
    .eq("id", user.id)
    .single();

  const menuItems = [
    {
      title: "My Orders",
      description: "Track, return, or buy things again",
      icon: ShoppingBag,
      href: "/orders",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "My Wishlist",
      description: "Your saved products",
      icon: Heart,
      href: "/wishlist",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Account Settings",
      description: "Edit profile, address, and location",
      icon: Settings,
      href: "/account/settings",
      color: "text-gray-600",
      bg: "bg-gray-100"
    },
    {
      title: "Notifications",
      description: "Offers & order updates",
      icon: Bell,
      href: "#", 
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Help Center",
      description: "FAQs and Customer Support",
      icon: HelpCircle,
      href: "/account/help",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      
      {/* 1. Profile Header */}
      <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 shrink-0">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="User" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{profile?.full_name || "Guest User"}</h1>
          <p className="text-sm text-gray-500 font-mono mb-1">{profile?.phone}</p>
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium capitalize border border-gray-200 tracking-wide">
            {profile?.role} Account
          </span>
        </div>
      </div>

      {/* 2. Grid Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <Link key={item.title} href={item.href} className="group block h-full active:scale-[0.98] transition-transform">
            <div className="h-full p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* 3. Logout Button */}
      <div className="pt-4">
        <LogoutButton />
      </div>

    </div>
  );
}