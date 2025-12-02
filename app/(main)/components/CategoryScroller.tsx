"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

export default function CategoryScroller({ categories }: { categories: Category[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true); // Assume true initially until measured

  // Function to check scroll position and update button visibility
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      // Show Left if we've scrolled past the start (tolerance of 1px)
      setShowLeft(scrollLeft > 0);
      
      // Show Right if we haven't reached the end (tolerance of 1px)
      // If content fits entirely (scrollWidth === clientWidth), this will be false
      setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // 1. Check on Mount and Resize
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]); // Re-run if categories change

  if (categories.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      // Note: The scroll event listener will update the state automatically after the animation
    }
  };

  return (
    <div className="bg-white border-b shadow-sm py-2 sm:py-3 relative group">
      
      {/* --- LEFT SCROLL BUTTON (Desktop Only) --- */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 hidden sm:flex items-center justify-start pl-2 transition-opacity duration-300",
          showLeft ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full shadow-md bg-white border-gray-200 hover:bg-gray-50"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        </Button>
      </div>

      {/* --- SCROLLABLE CONTAINER --- */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll} // 2. Check on Scroll
        className="flex overflow-x-auto gap-2 sm:gap-4 px-2 sm:px-4 scroll-smooth"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {categories.map((category) => {
          return (
            <Link
              href={`/category/${category.id}`}
              key={category.id}
              className="flex flex-col items-center gap-1 sm:gap-2 w-14 sm:w-20 shrink-0 group/item cursor-pointer hover:opacity-80 transition-opacity pb-1"
            >
              <div className="relative h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gray-50 overflow-hidden group-hover/item:border-blue-500 border border-transparent transition-all">
                {category.image_url ? (
                  <Image 
                    src={category.image_url} 
                    alt={category.name} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 40px, 56px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-400">
                    <LayoutGrid className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                )}
              </div>
              
              <span className="text-[10px] sm:text-xs text-center font-medium text-gray-700 leading-none w-full truncate group-hover/item:text-blue-600">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* --- RIGHT SCROLL BUTTON (Desktop Only) --- */}
      <div 
        className={cn(
          "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 hidden sm:flex items-center justify-end pr-2 transition-opacity duration-300",
          showRight ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full shadow-md bg-white border-gray-200 hover:bg-gray-50"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4 text-gray-700" />
        </Button>
      </div>
      
    </div>
  );
}