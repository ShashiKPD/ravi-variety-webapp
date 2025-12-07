"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Menu, User as UserIcon, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Header({ userRole, cartCount }: { userRole: string; cartCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const isAdmin = userRole === "admin";

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto">
        
        {/* ROW 1: Logo & Actions */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-blue-700 text-lg tracking-tight">Ravi Variety</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Wholesale</span>
            </div>
          </Link>

          {/* Desktop Search (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full pl-4 pr-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-blue-600">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Desktop Nav Links */}
            {isAdmin && (
               <Button variant="ghost" size="sm" asChild className="hidden md:flex text-blue-700 hover:bg-blue-50">
                 <Link href="/admin">Admin Panel</Link>
               </Button>
            )}

            {/* Account / Login (Desktop Only - Mobile uses Bottom Bar) */}
            <div className="hidden md:block">
              {userRole !== "anon" ? (
                <Button variant="ghost" size="sm" asChild className="gap-2">
                  <Link href="/account">
                    <UserIcon className="w-5 h-5" /> Account
                  </Link>
                </Button>
              ) : (
                <Button variant="default" size="sm" asChild className="bg-blue-600 hover:bg-blue-700 px-6">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>

            {/* Cart (Desktop Only - Mobile uses Bottom Bar) */}
            <Link href="/cart" className="hidden md:flex relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white">
                  {cartCount}
                </span>
              )}
              <span className="ml-2 font-medium text-gray-700 hidden lg:block">Cart</span>
            </Link>

            {/* Mobile: Admin Link (Icon only) */}
            {isAdmin && (
              <Link href="/admin" className="md:hidden p-2 text-blue-600">
                <Badge variant="outline" className="border-blue-200 bg-blue-50">Admin</Badge>
              </Link>
            )}
            
            {/* Mobile: Login (If anon) */}
            {userRole === "anon" && (
               <Link href="/login" className="md:hidden p-2 text-gray-700">
                 <LogIn className="w-6 h-6" />
               </Link>
            )}

          </div>
        </div>

        {/* ROW 2: Mobile Search (Visible only on Mobile) */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-9 h-10 bg-gray-100 border-none focus:ring-1 focus:ring-blue-500 font-normal shadow-inner"
              />
          </form>
        </div>
      </div>
    </header>
  );
}