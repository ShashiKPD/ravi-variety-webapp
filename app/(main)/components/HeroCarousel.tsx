"use client";

import { useRef } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

type Banner = {
  id: number;
  image_url: string;
  title: string | null;
};

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  // Initialize Autoplay plugin (4 seconds delay)
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  if (banners.length === 0) return null;

  return (
    <div className="w-full group relative">
      <Carousel
        className="w-full"
        opts={{ loop: true }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="-ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              <Card className="border-0 shadow-none rounded-none overflow-hidden p-0">
                {/* FIXED: Using the Aspect Ratio you requested */}
                <div className="relative aspect-[2.5/1] w-full">
                  <Image
                    src={banner.image_url}
                    alt={banner.title || "Offer"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={true}
                  />
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 hidden sm:flex bg-white/80 hover:bg-white border-none" />
        <CarouselNext className="right-4 hidden sm:flex bg-white/80 hover:bg-white border-none" />
      </Carousel>
    </div>
  );
}