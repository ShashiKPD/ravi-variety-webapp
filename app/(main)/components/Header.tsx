"use client";

import { useState, useEffect, useRef, Suspense, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronLeft, ScanBarcode, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const ScanToOrder = dynamic(() => import("@/components/scanner/ScanToOrder"), { ssr: false });

// ... (SearchBar remains unchanged) ...
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

  return (
    <>
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

export default function Header({ authSlot }: { authSlot: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const headerRef = useRef<HTMLElement>(null);

  // We use standard useEffect/useLayoutEffect for the event listener
  // But we keep the state in Refs to avoid React Re-renders (Performance)
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let prevScrollY = window.scrollY;
    let currentTranslateY = 0;
    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;
      const headerHeight = header.offsetHeight;
      
      // 1. Calculate the raw change in scroll
      const delta = scrollY - prevScrollY;
      prevScrollY = scrollY;

      // 2. Accumulate the change (The "Natural" Slide Logic)
      // Scrolling Down (positive delta) -> subtract from TranslateY (move up)
      // Scrolling Up (negative delta) -> add to TranslateY (move down)
      currentTranslateY -= delta;

      // 3. Clamp the value (The "Track" Logic)
      // Cannot be higher than 0 (Fully Visible)
      // Cannot be lower than -headerHeight (Fully Hidden)
      if (currentTranslateY > 0) currentTranslateY = 0;
      if (currentTranslateY < -headerHeight) currentTranslateY = -headerHeight;

      // 4. Force Reset at Top (Fixes rubber-banding issues)
      if (scrollY <= 0) {
        currentTranslateY = 0;
      }

      // 5. Apply to DOM
      header.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isContextPage = pathname?.startsWith("/category/");
  const isAdminPage = pathname?.startsWith("/admin");
  const shouldHideDesktopView = pathname.startsWith("/admin/products") || pathname.startsWith("/cart") || pathname.startsWith("/wishlist");
  const shouldHideMobileView = pathname.startsWith("/p/") || pathname.startsWith("/cart") || pathname.startsWith("/wishlist");
  
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header 
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100",
        // Force reset on desktop so the JS logic doesn't hide it on big screens
        "md:!transform-none"
      )}
      // Hardware acceleration hint for smooth sliding
      style={{ willChange: "transform", transform: "translate3d(0, 0, 0)" }}
    >
      <div className="max-w-[1400px] mx-auto">
        
        {/* MOBILE LAYOUT (< md) */}
        {!shouldHideMobileView && (
          <div className="md:hidden">
            {isContextPage ? (
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
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-3 pt-3 px-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center">
                    <Image src="/rv-logo-horizontal-transparent-v2-midres.png" alt="Ravi Variety" width={120} height={30} />
                    {/* <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl">R</div>
                    <span className="font-bold text-blue-700 text-lg">Ravi Variety</span> */}
                  </Link>

                  {/* Inject Slot */}
                  {authSlot}
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

        {/* DESKTOP LAYOUT (>= md) */}
        {!shouldHideDesktopView && (
        <div className="hidden md:flex items-center justify-between px-4 py-3 gap-6">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/rv-logo-horizontal-transparent-v2-midres.png" alt="Ravi Variety" width={160} height={40} />
            {/* <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl">R</div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-blue-700 text-xl tracking-tight">Ravi Variety</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Wholesale Portal</span>
            </div> */}
          </Link>

          <div className="flex-1 max-w-2xl">
             <Suspense fallback={<div className="h-10 bg-gray-100 rounded-full w-full" />}>
                <SearchBar onSearch={handleSearch} />
             </Suspense>
          </div>

          {authSlot}
        </div>
        )}
      </div>
    </header>
  );
}