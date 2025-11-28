"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveOrder, rejectOrder } from "../../orders/actions"; // Adjusted path to actions
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OrderActions({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm("Approve this order? Stock will be deducted immediately.")) return;
    setLoading(true);
    const res = await approveOrder(orderId);
    if (res.error) alert(res.error);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!confirm("Reject this order?")) return;
    setLoading(true);
    const res = await rejectOrder(orderId);
    if (res.error) alert(res.error);
    setLoading(false);
  };

  return (
    <div className="flex gap-3">
      <Button 
        variant="outline" 
        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        onClick={handleReject}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
        Reject Order
      </Button>
      
      <Button 
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={handleApprove}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
        Approve & Deduct Stock
      </Button>
    </div>
  );
}