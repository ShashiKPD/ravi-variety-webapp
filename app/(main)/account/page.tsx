import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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

  // Fetch basic profile for the header
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
      description: "Offers, order updates (Coming Soon)",
      icon: Bell,
      href: "#", // Placeholder
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
      
      {/* 1. Profile Header Card */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 shrink-0">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="User" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{profile?.full_name || "Guest"}</h1>
          <p className="text-sm text-gray-500 font-mono">{profile?.phone}</p>
          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize border border-slate-200">
            {profile?.role} Account
          </span>
        </div>
      </div>

      {/* 2. Grid Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <Link key={item.title} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-gray-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 3. Logout Section */}
      <div className="flex justify-center">
         <LogoutButton className="text-red-600 hover:bg-red-50 hover:text-red-700 w-full md:w-auto px-8" />
      </div>

    </div>
  );
}