import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon } from "lucide-react";
import { getCurrentUser } from "@/utils/supabase/get-user-profile";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButtons() {
  // 1. Fetch User (Cached)
  const { user, role } = await getCurrentUser();
  const isAdmin = role === "admin";
  const isGuest = !user || role === "anon";

  // 2. Fetch Avatar (Only if logged in)
  let avatarUrl = null;
  let name = null;

  if (!isGuest && user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", user.id)
      .single();
    avatarUrl = profile?.avatar_url;
    name = profile?.full_name;
  }

  // 3. Render the UI Fragment
  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <Link href="/admin">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 whitespace-nowrap">
            Admin
          </Badge>
        </Link>
      )}

      {isGuest ? (
        <Link 
          href="/login" 
          className="text-gray-400 md:text-gray-500 font-medium text-xs md:text-sm md:font-semibold hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          Retailer Login
        </Link>
      ) : (
        <Link 
          href="/account" 
          className="flex items-center gap-2 hover:bg-gray-50 md:p-1.5 md:pr-3 rounded-full border border-transparent hover:border-gray-100 transition-all"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl} 
                alt={name || "User"} 
                // fill 
                className="object-cover" 
                sizes="32px" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:inline-block">Account</span>
        </Link>
      )}
    </div>
  );
}