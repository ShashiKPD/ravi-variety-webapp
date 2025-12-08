"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// Adjust this import path if your actions file is located elsewhere (e.g. "@/app/admin/orders/actions")
import { approveOrder, rejectOrder } from "../../orders/actions"; 
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function OrderActions({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    // 1. Confirm Intent
    if (!confirm("Approve this order? Stock will be deducted immediately.")) return;
    
    setLoading(true);
    
    try {
      // 2. Call Server Action
      const res = await approveOrder(orderId);
      
      // 3. Handle Result
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Order approved successfully. Stock deducted.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Reject this order? This action cannot be undone.")) return;
    
    setLoading(true);
    
    try {
      const res = await rejectOrder(orderId);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Order rejected.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <Button 
        variant="outline" 
        className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 active:scale-95 transition-all"
        onClick={handleReject}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
        Reject Order
      </Button>
      
      <Button 
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white active:scale-95 transition-all"
        onClick={handleApprove}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
        Approve & Deduct Stock
      </Button>
    </div>
  );
}