"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

// We'll pass a className from the Header to style it
export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); // Force a server refresh to update state
  };

  return (
    // Use "ghost" variant and pass through the className
    <Button variant="ghost" onClick={handleLogout} className={className}>
      Logout
    </Button>
  );
}