"use client";

import { useState } from "react";
import { useCart } from "@/lib/context/CartContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const { clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // 1. Clear Client State
      clearCart();

      // 2. Clear Server Session
      await supabase.auth.signOut();

      // 3. Redirect
      router.push("/login?logout=success");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false); // Only reset if it failed, otherwise we are navigating away
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full flex items-center gap-2 justify-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4" />
          Sign Out
        </>
      )}
    </Button>
  );
}