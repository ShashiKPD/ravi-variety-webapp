"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ShoppingCart, User as UserIcon, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanBarcode } from "lucide-react";
import dynamic from "next/dynamic";

const ScanToOrder = dynamic(() => import("@/components/scanner/ScanToOrder"), { ssr: false });

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (<>
    <form onSubmit={handleSubmit} className="w-full relative">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full pl-9 h-10 bg-gray-100 border-none focus:ring-1 focus:ring-blue-500 font-normal shadow-inner rounded-full"
      />
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
       <button 
         type="button"
         onClick={() => setShowScanner(true)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1 lg:hidden"
       >
         <ScanBarcode className="w-5 h-5" />
       </button>
    </form>
    {showScanner && <ScanToOrder onClose={() => setShowScanner(false)} />}
    </>
  );
}

// UPDATE: Added userAvatar and userName to props
export default function Header({ 
  userRole, 
  cartCount,
  userAvatar,
  userName
}: { 
  userRole: string; 
  cartCount: number;
  userAvatar: string | null;
  userName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isContextPage = pathname?.startsWith("/category/");
  const isAdminPage = pathname?.startsWith("/admin");
  const isAdmin = userRole === "admin";
  const shouldHideDesktopView = pathname.startsWith("/admin/products");
  const shouldHideMobileView = pathname.startsWith("/p/");
  
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Helper to render Avatar or Fallback Icon
  const UserAvatar = () => (
    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
      {userAvatar ? (
        <Image 
          src={userAvatar} 
          alt={userName || "User"} 
          fill 
          className="object-cover"
          sizes="32px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 transition-all duration-200">
      <div className="max-w-[1400px] mx-auto">
        
        {/* =======================
            MOBILE LAYOUT (< md) 
           ======================= */}
        {!shouldHideMobileView && (
          <div className="md:hidden">
            {isContextPage ? (
              /* CONTEXT MODE: [Back] [Search] [Cart] */
              <div className="flex items-center gap-3 px-4 py-3">
                <button 
                  onClick={() => router.back()} 
                  className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex-1">
                  <Suspense fallback={<div className="h-10 bg-gray-100 rounded-full w-full animate-pulse" />}>
                    <SearchBar onSearch={handleSearch} />
                  </Suspense>
                </div>

                <Link href="/cart" className="relative p-2 text-gray-700">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white min-w-[18px] text-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              /* DEFAULT MODE: [Logo] [Avatar] + [Search Row] */
              <div className="flex flex-col gap-2 pb-3 pt-3 px-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
                      R
                    </div>
                    <span className="font-bold text-blue-700 text-lg">Ravi Variety</span>
                  </Link>

                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <Link href="/admin">
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Admin</Badge>
                      </Link>
                    )}
                    
                    {userRole !== "anon" ? (
                      <Link href="/account/">
                        <UserAvatar />
                      </Link>
                    ) : (
                      <Link href="/login" className="text-blue-600 font-medium text-sm">
                        Login
                      </Link>
                    )}
                  </div>
                </div>

                {!isAdminPage && (
                  <div className="mt-1">
                    <Suspense fallback={<div className="h-10 bg-gray-100 rounded-full w-full animate-pulse" />}>
                      <SearchBar onSearch={handleSearch} />
                    </Suspense>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =======================
            DESKTOP LAYOUT (>= md) 
           ======================= */}
        {!shouldHideDesktopView && (
        <div className="hidden md:flex items-center justify-between px-4 py-3 gap-6">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl">R</div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-blue-700 text-xl tracking-tight">Ravi Variety</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Wholesale Portal</span>
            </div>
          </Link>

          <div className="flex-1 max-w-2xl">
             <Suspense>
                <SearchBar onSearch={handleSearch} />
             </Suspense>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50">
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}

            {userRole !== "anon" ? (
              <Link href="/account" className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-gray-100 transition-all">
                <UserAvatar />
                <span className="text-sm font-medium text-gray-700">Account</span>
              </Link>
            ) : (
              <Button variant="default" size="sm" asChild className="bg-blue-600 hover:bg-blue-700 px-6">
                <Link href="/login">Login</Link>
              </Button>
            )}

            <Link href="/cart" className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="font-medium text-sm text-gray-700">Cart</span>
            </Link>
          </div>

        </div>
        )}
      </div>
    </header>
  );
}