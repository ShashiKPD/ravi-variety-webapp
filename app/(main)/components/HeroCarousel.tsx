"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Banner = {
  id: number;
  image_url: string;
  title: string | null;
};

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const AUTOPLAY_DELAY = 4000;

  const plugin = useRef(
    Autoplay({ 
      delay: AUTOPLAY_DELAY, 
      stopOnInteraction: false, 
      stopOnMouseEnter: true,   
    })
  );

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full group relative bg-white">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{ loop: true }}
        plugins={[plugin.current]}
      >
        <CarouselContent className="-ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              <Card className="border-0 shadow-none rounded-2xl mx-4 overflow-hidden p-0">
                <div className="relative aspect-[2.5/1] w-full">
                  <Image
                    src={banner.image_url}
                    alt={banner.title || "Offer"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={true}
                  />
                  {/* Optional: Removed gradient overlay since dots are outside now */}
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Arrows still inside the image area for clarity */}
        <CarouselPrevious className="left-8 hidden sm:flex bg-white/80 hover:bg-white border-none" />
        <CarouselNext className="right-8 hidden sm:flex bg-white/80 hover:bg-white border-none" />
      </Carousel>

      {/* CUSTOM ANIMATED DOTS (Moved Below) */}
      {/* Changed positioning from absolute to flex with margin-top */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, index) => {
          const isActive = index === current;
          return (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 overflow-hidden relative",
                // CHANGED COLORS: Gray background for visibility on white page
                isActive 
                  ? "w-8 bg-gray-200" 
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && (
                <div
                  className="absolute top-0 left-0 bottom-0 bg-blue-600 h-full" // CHANGED: Blue fill
                  style={{
                    animation: `fillProgress ${AUTOPLAY_DELAY}ms linear forwards`
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      <style jsx global>{`
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}