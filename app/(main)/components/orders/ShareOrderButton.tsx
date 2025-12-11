"use client";

import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  orderNumber: string;
};

export default function ShareOrderButton({ orderNumber }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = `Order #${orderNumber}`;
    const text = `Check out my order #${orderNumber}`;

    // 1. Try Native Share (Mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        console.warn("Share failed:", err);
      }
    }

    // 2. Fallback: Copy to Clipboard (Desktop)
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Order link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleShare}
      className="flex-1 sm:flex-none gap-2 bg-white min-w-[100px]"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
}