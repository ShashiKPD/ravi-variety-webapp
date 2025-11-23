"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  ShoppingCart,
  Menu,
  Search,
  User,
  ChevronRight,
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
  cartCount: number;
};

export default function Header({
  isLoggedIn,
  userRole,
  userName,
  cartCount,
}: HeaderProps) {
  const pathname = usePathname();
  
  // Logic: 
  // 1. isAdminPage: Any route starting with /admin. Use to hide Search.
  const isAdminPage = pathname.startsWith("/admin");
  
  // 2. isAdminDashboard: EXACTLY "/admin". Use to hide the "Admin Panel" link (since we are already there).
  const isAdminDashboard = pathname === "/admin";

  return (
    <header className="flex flex-col sticky top-0 z-50">
      
      {/* --- Top Bar (Dark Slate) --- */}
      <div className="bg-gray-800 text-white">
        <nav className="flex justify-between items-center max-w-6xl mx-auto p-3">
          
          {/* --- Left Side: Hamburger (Mobile) & Logo --- */}
          <div className="flex items-center gap-2">
            
            {/* Left Sheet (Main Menu) - Mobile Only */}
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
                  <SheetTitle className="text-xl">
                    Hello, {userName || "Guest"}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto mt-6">
                  <div className="flex flex-col space-y-2">
                    {userRole === "admin" && (
                      <Button
                        variant="ghost"
                        asChild
                        className="justify-start text-base font-bold"
                      >
                        <Link href="/admin">Admin Panel</Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      asChild
                      className="justify-start text-base"
                    >
                      <Link href="/wishlist">Wishlist</Link>
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
            
            <Link href="/" className="text-xl font-bold">
              Ravi Variety
            </Link>
          </div>
          
          {/* --- Right Side: Icons & User Menu --- */}
          <div className="flex gap-2 items-center">
            
            {/* Desktop "Admin Panel" Link */}
            {/* Show IF: User is admin AND we are NOT on the dashboard itself */}
            {userRole === 'admin' && !isAdminDashboard && (
              <Button
                variant="ghost"
                asChild
                className="text-white hover:bg-gray-700 hover:text-white hidden sm:flex"
              >
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" passHref>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                className="text-white hover:bg-gray-700"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart" passHref>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                className="relative text-white hover:bg-gray-700"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-medium text-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* Right Sheet (User Menu) */}
            <Sheet>
              <SheetTrigger asChild>
                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-gray-700 p-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2 text-sm font-medium">
                      {userName}
                    </span>
                  </Button>
                ) : (
                  <Link
                    href="/login"
                    className="py-2 px-3 rounded-md bg-gray-100 text-gray-900 text-sm font-medium"
                  >
                    Login
                  </Link>
                )}
              </SheetTrigger>
              {isLoggedIn && (
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Hello, {userName}</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-2 mt-6">
                    <Button
                      variant="ghost"
                      asChild
                      className="justify-between text-base"
                    >
                      <Link href="/account">
                        Account Management <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    {userRole === "admin" && (
                      <Button
                        variant="ghost"
                        asChild
                        className="justify-between text-base"
                      >
                        <Link href="/admin">
                          Admin Panel <ChevronRight className="h-4 w-4" />
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

      {/* --- Second Bar (Search) --- */}
      {/* Hide this bar completely if we are on ANY admin page */}
      {!isAdminPage && (
        <div className="p-3 bg-white border-b shadow-sm">
          <div className="relative max-w-6xl mx-auto">
            <Input
              type="search"
              placeholder="Search Ravi Variety..."
              className="w-full pl-10 rounded-md border-gray-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
        </div>
      )}
    </header>
  );
}