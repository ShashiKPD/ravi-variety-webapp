"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronDown, ChevronUp, Users, Store } from "lucide-react";
import { BulkTier } from "./types";

type Props = {
  tiers: BulkTier[];
  onChange: (tiers: BulkTier[]) => void;
};

export default function BulkPricingManager({ tiers, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const addTier = (role: 'retailer' | 'wholesaler') => {
    onChange([...tiers, { role, minQuantity: 10, unitPrice: 0 }]);
  };

  const removeTier = (index: number) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    onChange(newTiers);
  };

  const updateTier = (index: number, field: keyof BulkTier, value: number) => {
    const newTiers = [...tiers];
    // @ts-ignore
    newTiers[index][field] = value;
    onChange(newTiers);
  };

  // Helper to render a list of tiers for a specific role
  const TierList = ({ role, icon: Icon, label }: { role: 'retailer' | 'wholesaler', icon: any, label: string }) => {
    const roleTiers = tiers.map((t, i) => ({ ...t, originalIndex: i })).filter(t => t.role === role);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <Icon className="w-3.5 h-3.5" /> {label}
          </div>
          <Button 
            type="button" variant="ghost" size="sm" 
            onClick={() => addTier(role)}
            className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Rule
          </Button>
        </div>

        {roleTiers.length === 0 ? (
          <div className="text-xs text-gray-400 italic bg-gray-50/50 p-2 rounded border border-dashed text-center">
            No bulk rules defined. Standard price applies.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-400 font-medium px-1">
              <div className="col-span-5">Min Qty</div>
              <div className="col-span-5">Unit Price (₹)</div>
              <div className="col-span-2"></div>
            </div>
            {roleTiers.map((tier) => (
              <div key={tier.originalIndex} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input 
                    type="number" 
                    value={tier.minQuantity} 
                    onChange={e => updateTier(tier.originalIndex, 'minQuantity', parseFloat(e.target.value))}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="col-span-5">
                  <Input 
                    type="number" 
                    value={tier.unitPrice} 
                    onChange={e => updateTier(tier.originalIndex, 'unitPrice', parseFloat(e.target.value))}
                    className="h-8 text-xs bg-white font-medium"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => removeTier(tier.originalIndex)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50/30 overflow-hidden">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="space-y-0.5">
          <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer">Bulk Pricing Rules (Optional)</Label>
          <p className="text-[10px] text-gray-400">Set tiered discounts for Retailers & Wholesalers.</p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in slide-in-from-top-2">
          <TierList role="retailer" icon={Store} label="Retailer Tiers" />
          <TierList role="wholesaler" icon={Users} label="Wholesaler Tiers" />
        </div>
      )}
    </div>
  );
}