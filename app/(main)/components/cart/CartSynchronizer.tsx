"use client";

import { useEffect, useRef, useState } from "react";
import { useCart, LocalCartItem } from "@/lib/context/CartContext";
import { bulkSyncCart } from "@/app/(main)/cart/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ServerItem = {
  product_id: number;
  quantity: number;
  name?: string;
  image_url?: string | null;
  unit_price?: number; 
  stock?: number;
};

type Props = {
  serverItems: ServerItem[];
};

export default function CartSynchronizer({ serverItems }: Props) {
  const { items: localItems, isLoaded, replaceCart } = useCart();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoaded || hasChecked.current) return;
    
    const needsSync = () => {
      // CASE A: Server has items, Local is empty.
      if (serverItems.length > 0 && localItems.length === 0) {
        
        // FIX: Check if we have local history
        // If "local_cart" exists in storage (even as "[]"), the user actively cleared it.
        const hasLocalHistory = typeof window !== 'undefined' && localStorage.getItem("local_cart") !== null;

        if (hasLocalHistory) {
          // User cleared the cart locally. We must wipe the server too.
          return "PUSH";
        } else {
          // No local history. User is on a new device. Restore from server.
          return "PULL";
        }
      }

      // CASE B: Standard Mismatch Check
      if (serverItems.length !== localItems.length) return "PUSH";

      for (const local of localItems) {
        const serverMatch = serverItems.find(s => s.product_id === local.id);
        if (!serverMatch || serverMatch.quantity !== local.qty) {
          return "PUSH";
        }
      }
      return "NONE";
    };

    const action = needsSync();

    if (action === "PUSH") {
      hasChecked.current = true;
      setIsSyncing(true);
      
      const performPush = async () => {
        const syncData = localItems.map(i => ({ productId: i.id, quantity: i.qty }));
        await bulkSyncCart(syncData);
        router.refresh(); 
        setIsSyncing(false);
      };
      performPush();

    } else if (action === "PULL") {
      const hydratedItems: LocalCartItem[] = serverItems.map(s => ({
        id: s.product_id,
        qty: s.quantity,
        name: s.name || "Product", 
        image_url: s.image_url || null,
        pack_size: 1, 
        price: s.unit_price || 0
      }));
      
      replaceCart(hydratedItems);
      hasChecked.current = true;
      
    } else {
      hasChecked.current = true;
    }

  }, [localItems, serverItems, router, isLoaded, replaceCart]);

  if (!isSyncing) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-500 font-medium">Syncing your cart...</p>
    </div>
  );
}