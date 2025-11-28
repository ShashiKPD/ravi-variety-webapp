"use client";

import Link from "next/link";
import Image from "next/image"; // Import Image
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  ShoppingCart,
  Menu,
  Search,
  User,
  ChevronRight,
  Settings, // Added Icon
} from "lucide-react";
import LogoutButton from "./LogoutButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type HeaderProps = {
  isLoggedIn: boolean;
  userRole: string | null;
  userName: string | null;
  userAvatar: string | null; // New Prop
  cartCount: number;
};

export default function Header({
  isLoggedIn,
  userRole,
  userName,
  userAvatar,
  cartCount,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", searchQuery.trim());
    params.set("page", "1");
    
    router.push(`/search?${params.toString()}`);
  };

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminDashboard = pathname === "/admin";

  return (
    <header className="flex flex-col sticky top-0 z-50">
      
      {/* --- Top Bar --- */}
      <div className="bg-gray-800 text-white">
        <nav className="flex justify-between items-center max-w-6xl mx-auto p-3">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-700 sm:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] flex flex-col">
                <SheetHeader>
                  <SheetTitle className="text-xl text-left">
                    Hello, {userName || "Guest"}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto mt-6">
                  <div className="flex flex-col space-y-2">
                    {userRole === "admin" && (
                      <Button variant="ghost" asChild className="justify-start text-base font-bold">
                        <Link href="/admin">Admin Panel</Link>
                      </Button>
                    )}
                    <Button variant="ghost" asChild className="justify-start text-base">
                      <Link href="/account">Account Settings</Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start text-base">
                      <Link href="/wishlist">Wishlist</Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start text-base">
                      <Link href="/orders">My Orders</Link>
                    </Button>
                  </div>
                </nav>
                {isLoggedIn && (
                  <div className="pt-4 border-t">
                    <LogoutButton className="text-red-500 justify-start p-0 h-auto hover:underline" />
                  </div>
                )}
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="text-xl font-bold">Ravi Variety</Link>
          </div>
          
          {/* Right: Icons & User */}
          <div className="flex gap-2 items-center">
            
            {userRole === 'admin' && !isAdminDashboard && (
              <Button variant="ghost" asChild className="text-white hover:bg-gray-700 hover:text-white hidden sm:flex">
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}

            <Link href="/wishlist" passHref>
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="text-white hover:bg-gray-700">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative text-white hover:bg-gray-700">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-medium text-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* User Menu Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                {isLoggedIn ? (
                  <Button variant="ghost" className="text-white hover:bg-gray-700 p-1 pr-2 gap-2 h-auto">
                    {/* Avatar Logic */}
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600 bg-gray-700">
                      {userAvatar ? (
                        <Image src={userAvatar} alt="User" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
                      {userName}
                    </span>
                  </Button>
                ) : (
                  <Link href="/login" className="py-2 px-3 rounded-md bg-gray-100 text-gray-900 text-sm font-medium">
                    Login
                  </Link>
                )}
              </SheetTrigger>
              
              {isLoggedIn && (
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="text-left">Hello, {userName}</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-2 mt-6">
                    {/* LINK ADDED HERE */}
                    <Button variant="ghost" asChild className="justify-between text-base h-12">
                      <Link href="/account">
                        <span className="flex items-center gap-3">
                          <Settings className="h-4 w-4 text-gray-500" /> Account Settings
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </Button>

                    <Button variant="ghost" asChild className="justify-between text-base h-12">
                      <Link href="/orders">
                        <span className="flex items-center gap-3">
                          <ShoppingCart className="h-4 w-4 text-gray-500" /> My Orders
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </Button>

                    {userRole === "admin" && (
                      <Button variant="ghost" asChild className="justify-between text-base h-12">
                        <Link href="/admin">
                          <span className="flex items-center gap-3 font-semibold text-blue-600">
                             Admin Panel
                          </span>
                          <ChevronRight className="h-4 w-4 text-blue-600" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 pt-4 border-t">
                    <LogoutButton className="text-red-500 justify-start p-0 h-auto hover:underline" />
                  </div>
                </SheetContent>
              )}
            </Sheet>

          </div>
        </nav>
      </div>

      {/* --- Search Bar --- */}
      {!isAdminPage && (
        <div className="p-3 bg-white border-b shadow-sm">
          <div className="relative max-w-6xl mx-auto">
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Ravi Variety..."
                className="w-full pl-10 rounded-md border-gray-300"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-500" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}