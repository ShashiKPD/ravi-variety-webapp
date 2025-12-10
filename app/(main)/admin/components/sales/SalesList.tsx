"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Tag, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import SaleForm, { Sale } from "./SaleForm";

export default function SalesList({ initialSales }: { initialSales: Sale[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | undefined>(undefined);

  const openNew = () => {
    setEditingSale(undefined);
    setIsOpen(true);
  };

  const openEdit = (sale: Sale) => {
    setEditingSale(sale);
    setIsOpen(true);
  };

  // Helper to determine status badge
  const getStatus = (sale: Sale) => {
    const now = new Date();
    const start = new Date(sale.start_at);
    const end = new Date(sale.end_at);

    if (!sale.is_active) return { label: "Paused", color: "bg-gray-100 text-gray-500 border-gray-200" };
    if (now > end) return { label: "Ended", color: "bg-red-50 text-red-600 border-red-100" };
    if (now < start) return { label: "Scheduled", color: "bg-yellow-50 text-yellow-700 border-yellow-100" };
    return { label: "Live Now", color: "bg-green-50 text-green-700 border-green-100 animate-pulse" };
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-md">
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {/* List Grid */}
      {initialSales.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed rounded-xl">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No active campaigns</h3>
          <p className="text-gray-500 text-sm">Create a sale to start discounting products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialSales.map((sale) => {
            const status = getStatus(sale);
            return (
              <div 
                key={sale.id} 
                onClick={() => openEdit(sale)}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {sale.name}
                  </h3>
                  <Badge variant="outline" className={`border-0 ${status.color}`}>
                    {status.label}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(sale.start_at).toLocaleDateString()} - {new Date(sale.end_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-2">
                    {sale.applicable_roles.map(r => (
                      <span key={r} className="bg-gray-100 px-1.5 py-0.5 rounded capitalize text-[10px]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50/50">
            <DialogTitle>{editingSale ? "Edit Campaign" : "New Campaign"}</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <SaleForm 
              initialData={editingSale} 
              onClose={() => setIsOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}