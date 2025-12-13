"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
};

export default function MobileProductHeader({ title }: Props) {
  const router = useRouter();
  const [opacity, setOpacity] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Calculate Opacity on Scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Calculate opacity: 0 at top, 1 at 120px down
      const newOpacity = Math.min(Math.max(scrollY / 120, 0), 1);
      setOpacity(newOpacity);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  // Helper to determine if we are in "Transparent Mode" (image visible behind)
  // Used to add backdrops to buttons so they are visible over the image
  const isTransparent = opacity < 0.8;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[60] h-14 px-4 lg:hidden flex items-center gap-3 transition-colors duration-100"
      style={{
        // Smoothly interpolate background opacity
        backgroundColor: isSearchOpen ? "rgba(255, 255, 255, 1)" : `rgba(255, 255, 255, ${opacity})`,
        // Smoothly fade in the border
        borderBottom: isSearchOpen ? "1px solid #e5e7eb" : `1px solid rgba(229, 231, 235, ${opacity})`,
        // Smoothly fade in shadow
        boxShadow: isSearchOpen ? "none" : `0 1px 3px 0 rgba(0, 0, 0, ${opacity * 0.05})`
      }}
    >
      {/* LEFT: Back Button */}
      <button
        onClick={() => isSearchOpen ? setIsSearchOpen(false) : router.back()}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-full transition-all shrink-0",
          // If transparent, add backdrop. If solid white header, just hover effect.
          isTransparent && !isSearchOpen 
            ? "bg-white/60 backdrop-blur-md shadow-sm text-gray-900" 
            : "hover:bg-gray-100 text-gray-700"
        )}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* CENTER: Title OR Search Input */}
      <div className="flex-1 min-w-0 flex justify-center">
        {isSearchOpen ? (
          <form onSubmit={handleSearchSubmit} className="w-full animate-in fade-in slide-in-from-right-5 duration-200">
            <Input
              autoFocus
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm bg-gray-100 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </form>
        ) : (
          <h1
            className="text-sm font-bold truncate text-center text-gray-900 max-w-[200px]"
            style={{ opacity: opacity }} // Title fades in with the background
          >
            {title}
          </h1>
        )}
      </div>

      {/* RIGHT: Search Toggle */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-full transition-all shrink-0",
          isTransparent && !isSearchOpen 
            ? "bg-white/60 backdrop-blur-md shadow-sm text-gray-900" 
            : "hover:bg-gray-100 text-gray-700"
        )}
      >
        {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>
    </header>
  );
}