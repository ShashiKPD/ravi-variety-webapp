"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type Props = {
  images: string[];
  title: string;
};

export default function ProductImageGallery({ images, title }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Handle images array being empty or null
  const displayImages = images && images.length > 0 ? images : ["/placeholder.png"];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Main Swipeable Carousel */}
      <div className="relative aspect-square w-full bg-white rounded-lg border overflow-hidden group">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent>
            {displayImages.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={img}
                    alt={`${title} - View ${index + 1}`}
                    fill
                    className="object-contain mix-blend-multiply"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows (Hidden on mobile touch, visible on hover for desktop) */}
          {displayImages.length > 1 && (
            <>
              <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
              <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
            </>
          )}
        </Carousel>

        {/* Mobile Counter Badge (Optional, helps UX) */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
            {current} / {count}
          </div>
        )}
      </div>

      {/* Thumbnails (Acts as Navigation) */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-1 scrollbar-hide">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={cn(
                "relative w-16 h-16 flex-shrink-0 rounded-md border bg-white overflow-hidden transition-all",
                current === idx + 1 
                  ? "ring-2 ring-blue-600 border-transparent" 
                  : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}