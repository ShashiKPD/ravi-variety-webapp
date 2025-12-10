"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { upsertSale, deleteSale } from "../../sales/actions";
import { Loader2, Trash2, Calendar, Save } from "lucide-react";
import { toast } from "sonner";

export type Sale = {
  id: number;
  name: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  applicable_roles: string[];
};

export default function SaleForm({ initialData, onClose }: { initialData?: Sale, onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  // Helper to format DB timestamp to Input's datetime-local format (YYYY-MM-DDTHH:mm)
  const toLocalISO = (isoString?: string) => {
    if (!isoString) return new Date().toISOString().slice(0, 16);
    return new Date(isoString).toISOString().slice(0, 16);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const res = await upsertSale(formData);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !confirm("Delete this campaign? It will remove all associated product discounts.")) return;
    
    setLoading(true);
    const res = await deleteSale(initialData.id);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      onClose();
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label className="text-xs uppercase font-bold text-gray-500 mb-1.5 block">Campaign Name</Label>
          <Input 
            name="name" 
            defaultValue={initialData?.name} 
            required 
            placeholder="e.g. Diwali Dhamaka" 
            className="h-9 font-medium"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase font-bold text-gray-500 mb-1.5 block">Start Time</Label>
            <div className="relative">
              <Input 
                type="datetime-local" 
                name="start_at" 
                defaultValue={toLocalISO(initialData?.start_at)}
                required 
                className="h-9 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase font-bold text-gray-500 mb-1.5 block">End Time</Label>
            <div className="relative">
              <Input 
                type="datetime-local" 
                name="end_at" 
                defaultValue={toLocalISO(initialData?.end_at)}
                required 
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Roles */}
        <div>
          <Label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Target Audience</Label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
              <Switch name="role_retailer" defaultChecked={!initialData || initialData.applicable_roles.includes("retailer")} />
              <span className="text-sm font-medium text-gray-700">Retailers</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
              <Switch name="role_wholesaler" defaultChecked={!initialData || initialData.applicable_roles.includes("wholesaler")} />
              <span className="text-sm font-medium text-gray-700">Wholesalers</span>
            </label>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-blue-900">Campaign Status</Label>
            <p className="text-[10px] text-blue-700">Turn off to pause sale instantly</p>
          </div>
          <Switch name="is_active" defaultChecked={initialData ? initialData.is_active : true} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        {initialData && (
          <Button 
            type="button" 
            variant="destructive" 
            size="icon" 
            className="shrink-0" 
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </div>
    </form>
  );
}