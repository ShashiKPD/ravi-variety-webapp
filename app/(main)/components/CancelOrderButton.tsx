"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";
import { cancelUserOrder } from "../orders/actions";

export default function CancelOrderButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    setLoading(true);
    const res = await cancelUserOrder(orderId);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleCancel} 
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
      Cancel Order
    </Button>
  );
}