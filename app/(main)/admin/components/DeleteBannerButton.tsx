"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteBanner } from "../banners/actions";

export default function DeleteBannerButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this banner?")) return;
    setLoading(true);
    await deleteBanner(id);
    setLoading(false);
  };

  return (
    <Button 
      variant="destructive" 
      size="icon" 
      className="h-8 w-8 shadow-md" 
      onClick={handleDelete} 
      disabled={loading}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}