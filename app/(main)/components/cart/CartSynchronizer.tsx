"use client";

import { useEffect, useRef, useState } from "react";
import { useCart, LocalCartItem } from "@/lib/context/CartContext";
import { bulkSyncCart } from "@/app/(main)/cart/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ServerItem = {
  product_id: number;
  quantity: number;
  // We need these to hydrate local state if it's empty
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

  // 1. SCROLL TO TOP ON MOUNT
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. SYNC LOGIC
  useEffect(() => {
    // CRITICAL: Wait for LocalStorage to load before deciding anything
    if (!isLoaded || hasChecked.current) return;
    
    const needsSync = () => {
      // CASE A: Server has items, Local is empty.
      // This means "Fresh Session" or "New Device". 
      // We should PULL server data -> Local. (Prevent Wipe)
      if (serverItems.length > 0 && localItems.length === 0) {
        return "PULL";
      }

      // CASE B: Local has items.
      // We assume Local is the source of truth for an active session.
      // We check if it differs from server.
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
      // Hydrate Local from Server
      // We map the rich server data back to the simple local format
      const hydratedItems: LocalCartItem[] = serverItems.map(s => ({
        id: s.product_id,
        qty: s.quantity,
        name: s.name || "Product", // Fallback if not passed (handled in page)
        image_url: s.image_url || null,
        pack_size: 1, // Server RPC should ideally return this, but 1 is safe default for hydration
        price: s.unit_price || 0
      }));
      
      replaceCart(hydratedItems);
      hasChecked.current = true;
      
    } else {
      // Match!
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