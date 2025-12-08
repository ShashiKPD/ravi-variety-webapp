"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function LogoutButton({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    await supabase.auth.signOut();
    // Force full page reload to clear client-side cache
    window.location.href = "/login";
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout} 
      className={className}
      disabled={isLoading}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}