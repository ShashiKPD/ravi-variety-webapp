import { createClient } from "@/utils/supabase/server";
import SalesList from "../components/sales/SalesList"; // Client component wrapper
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SalesPage() {
  const supabase = await createClient();
  
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .order("start_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sale Campaigns</h1>
      </div>
      
      {/* We pass data to a client component to handle the "Add/Edit" modal state */}
      <SalesList initialSales={sales || []} />
    </div>
  );
}