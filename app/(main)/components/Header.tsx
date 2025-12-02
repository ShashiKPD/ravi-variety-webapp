"use client";

import Link from "next/link";
import Image from "next/image";
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
  Settings,
  ShoppingBag,
  LayoutGrid,
  Store,
  Home
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
  userAvatar: string | null;
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
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

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
    
    setIsLeftOpen(false); // Close mobile menu if searching
    router.push(`/search?${params.toString()}`);
  };

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminDashboard = pathname === "/admin";

  return (
    <header className="flex flex-col sticky top-0 z-50">
      
      <div className="bg-gray-800 text-white">
        <nav className="flex justify-between items-center max-w-[1400px] mx-auto p-3">
          
          <div className="flex items-center gap-2">
            <Sheet open={isLeftOpen} onOpenChange={setIsLeftOpen}>
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
                    Browse Store
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex-1 overflow-y-auto mt-6">
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" asChild className="justify-start text-base h-12" onClick={() => setIsLeftOpen(false)}>
                      <Link href="/">
                        <Home className="mr-3 h-5 w-5 text-gray-500" /> Home
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start text-base h-12" onClick={() => setIsLeftOpen(false)}>
                      <Link href="/search">
                        <Store className="mr-3 h-5 w-5 text-gray-500" /> All Products
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start text-base h-12" onClick={() => setIsLeftOpen(false)}>
                      <Link href="/search?categories=1"> 
                        <LayoutGrid className="mr-3 h-5 w-5 text-gray-500" /> Categories
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="text-lg sm:text-xl font-bold tracking-tight">
              Ravi Variety
            </Link>
          </div>
          
          <div className="flex gap-1 sm:gap-2 items-center">
            
            {userRole === 'admin' && !isAdminDashboard && (
              <Button variant="ghost" asChild className="text-white hover:bg-gray-700 hover:text-white hidden sm:flex font-medium">
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}

            <Link href="/wishlist" passHref>
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="text-white hover:bg-gray-700 hidden sm:flex">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative text-white hover:bg-gray-700">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-medium text-center flex items-center justify-center border-2 border-gray-800">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Sheet open={isRightOpen} onOpenChange={setIsRightOpen}>
              <SheetTrigger asChild>
                {isLoggedIn ? (
                  <Button variant="ghost" className="text-white hover:bg-gray-700 p-1 pr-2 gap-2 h-auto ml-1">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600 bg-gray-700 shrink-0">
                      {userAvatar ? (
                        <Image src={userAvatar} alt="User" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    <span className="hidden sm:inline text-sm font-medium">
                      {userName}
                    </span>
                  </Button>
                ) : (
                  <Link href="/login" className="ml-2 py-2 px-4 rounded-md bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 transition-colors">
                    Login
                  </Link>
                )}
              </SheetTrigger>
              
              {isLoggedIn && (
                <SheetContent side="right" className="w-[300px] flex flex-col">
                  <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="text-left flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border bg-gray-100 shrink-0">
                        {userAvatar ? (
                          <Image src={userAvatar} alt="User" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold leading-tight break-words">{userName}</span>
                        <span className="text-xs text-gray-500 font-normal capitalize">{userRole} Account</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col space-y-1 mt-4 flex-1">
                    {userRole === "admin" && (
                      <Button variant="ghost" asChild className="justify-between text-base h-12 hover:bg-blue-50 hover:text-blue-700" onClick={() => setIsRightOpen(false)}>
                        <Link href="/admin">
                          <span className="flex items-center gap-3 font-semibold text-blue-600">
                             Admin Panel
                          </span>
                          <ChevronRight className="h-4 w-4 text-blue-600" />
                        </Link>
                      </Button>
                    )}

                    <Button variant="ghost" asChild className="justify-between text-base h-12" onClick={() => setIsRightOpen(false)}>
                      <Link href="/orders">
                        <span className="flex items-center gap-3">
                          <ShoppingBag className="h-4 w-4 text-gray-500" /> My Orders
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </Button>

                    <Button variant="ghost" asChild className="justify-between text-base h-12" onClick={() => setIsRightOpen(false)}>
                      <Link href="/wishlist">
                        <span className="flex items-center gap-3">
                          <Heart className="h-4 w-4 text-gray-500" /> My Wishlist
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </Button>

                    <Button variant="ghost" asChild className="justify-between text-base h-12" onClick={() => setIsRightOpen(false)}>
                      <Link href="/account">
                        <span className="flex items-center gap-3">
                          <Settings className="h-4 w-4 text-gray-500" /> Account Settings
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </Button>
                  </nav>

                  <div className="pt-4 border-t pb-4">
                    <LogoutButton className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12 font-medium" />
                  </div>
                </SheetContent>
              )}
            </Sheet>

          </div>
        </nav>
      </div>

      {!isAdminPage && (
        // CHANGED: Reduced vertical padding 'py-2' for both mobile and desktop
        <div className="bg-white border-b shadow-sm py-2 px-3 sm:px-4">
          <div className="relative max-w-[1400px] mx-auto">
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                // CHANGED: 'h-9' (36px) for both mobile and desktop for a compact look
                // Removed 'sm:h-11'
                className="w-full pl-9 sm:pl-10 h-9 text-sm rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors"
              />
              <button type="submit" className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 p-1">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}