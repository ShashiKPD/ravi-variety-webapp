"use client";

import { useState } from "react";
import { toggleWishlistItem } from "../wishlist/actions"; // 1. Import the Server Action
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function WishlistButton({
  productId,
  isInitiallyWishlisted = false, // 1. Accept the initial state prop
}: {
  productId: number;
  isInitiallyWishlisted?: boolean;
}) {
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleWishlistClick = async () => {
    // 3. Optimistic Update:
    //    We immediately toggle the state *before* calling the server.
    const originalState = isWishlisted;
    setIsWishlisted(!originalState);
    setIsLoading(true);

    const result = await toggleWishlistItem(productId);
    console.log(result.success);

    setIsLoading(false);

    // 4. If the server call fails, we revert the state
    if (result.error) {
      alert(result.error);
      setIsWishlisted(originalState); // Revert on error
    }
    // On success, we do nothing. The optimistic state was correct.
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleWishlistClick}
      disabled={isLoading}
      className="absolute top-2 right-2 z-10" // Position it
    >
      <Heart
        className={`h-6 w-6 transition-colors ${
          isWishlisted
            ? "fill-red-500 text-red-500" // Filled and red
            : "text-gray-500" // Just the gray outline
        }`}
      />
    </Button>
  );
}