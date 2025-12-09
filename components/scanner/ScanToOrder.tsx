"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import BaseScanner from "./BaseScanner";
import { getProductByBarcode } from "@/app/actions/scanner";
import { addToCart } from "@/app/(main)/cart/actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Plus, Minus, ShoppingCart, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

// Simple beep sound effect using Audio API
const playBeep = () => {
  const audio = new Audio("/sounds/beep.mp3"); // Ensure you have a beep.mp3 in public/sounds
  // Fallback if no file:
  if(!audio) return;
  audio.play().catch(() => {});
};

type ScannedItem = {
  id: number;
  name: string;
  image: string | null;
  price: number;
  qty: number;
  unit: string;
  isAddingToCart?: boolean;
};

export default function ScanToOrder({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // Processing the barcode lookup
  const lastScannedCode = useRef<string>("");
  const lastScanTime = useRef<number>(0);

  const handleScan = async (code: string) => {
    const now = Date.now();
    // Debounce: Ignore same code if scanned within 1.5 seconds
    if (code === lastScannedCode.current && now - lastScanTime.current < 1500) {
      return;
    }
    
    lastScannedCode.current = code;
    lastScanTime.current = now;
    playBeep();

    // 1. Check if item already exists in our local list
    // Note: We need to fetch product ID from code first usually, but for UX speed, 
    // we'll assume we need to look it up if we haven't mapped Code -> ID locally yet.
    // However, since `items` only has ID, we fetch every time to be safe, 
    // OR we check if the code matches a "known" list. 
    
    setIsProcessing(true);
    const { product, error } = await getProductByBarcode(code);
    setIsProcessing(false);

    if (error || !product) {
      toast.error(`Unknown barcode: ${code}`);
      return;
    }

    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        toast.success(`+1 ${product.name}`);
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      } else {
        toast.success(`Added ${product.name}`);
        return [{ ...product, qty: 1 }, ...prev]; // Add to top
      }
    });
  };

  const updateQty = (id: number, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItemLocally = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAddToCart = async (index: number) => {
    const item = items[index];
    
    // Optimistic loading state
    const newItems = [...items];
    newItems[index].isAddingToCart = true;
    setItems(newItems);

    const res = await addToCart(item.id, item.qty);

    if (res.error) {
      toast.error(res.error);
      // Revert loading
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAddingToCart: false } : i));
    } else {
      toast.success(`${item.name} added to cart!`);
      // Remove from list after adding? Or keep it? 
      // Requirement: "Add to cart button at end of card". 
      // Usually you remove it from the "Scanned list" once added to avoid double adding.
      removeItemLocally(item.id); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 1. The Scanner */}
      <BaseScanner onScan={handleScan} onClose={onClose} />

      {/* 2. Visual Feedback for Processing */}
      {isProcessing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg z-30 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Looking up product...
        </div>
      )}

      {/* 3. The Bottom Drawer (Persistent List) */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.3)] max-h-[60vh] flex flex-col transition-transform duration-300 transform translate-y-0">
        
        {/* Handle Bar */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
           <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="px-4 py-2 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Scanned Items ({items.length})</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7">Close Camera</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Package className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Scan a barcode to start</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-xl shadow-sm bg-white items-center">
                {/* Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 relative overflow-hidden border">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info & Qty */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
                    
                    {/* Qty Control */}
                    <div className="flex items-center border rounded-md h-7 bg-gray-50">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Action */}
                <Button 
                  size="icon" 
                  onClick={() => handleAddToCart(idx)}
                  disabled={item.isAddingToCart}
                  className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700 rounded-full shadow-md"
                >
                  {item.isAddingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}