"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  title: string;
};

export default function ProductImageGallery({ images, title }: Props) {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full bg-white rounded-lg border overflow-hidden">
        <Image
          src={mainImage || "/placeholder.png"}
          alt={title}
          fill
          className="object-contain p-4"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded-md border bg-white overflow-hidden hover:ring-2 ring-blue-500 transition-all",
                mainImage === img ? "ring-2 ring-blue-600" : "border-gray-200"
              )}
            >
              <Image
                src={img}
                alt={`View ${idx + 1}`}
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