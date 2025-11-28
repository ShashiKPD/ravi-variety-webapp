"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleWishlistItem } from "../wishlist/actions"; 
import { useRouter } from "next/navigation";

type Props = {
  productId: number;
  isInitiallyWishlisted: boolean;
};

export default function WishlistButton({ productId, isInitiallyWishlisted }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    const previousState = isWishlisted;
    
    setIsWishlisted(!previousState);
    setIsLoading(true);

    const result = await toggleWishlistItem(productId);

    setIsLoading(false);

    if (result.error) {
      setIsWishlisted(previousState);
      if (result.error.includes("logged in")) {
        router.push("/login");
      } else {
        alert(result.error);
      }
    } else {
      if (result.isWishlisted !== undefined) {
        setIsWishlisted(result.isWishlisted);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-gray-100"
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-200",
          isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 hover:text-gray-600"
        )}
      />
    </Button>
  );
}