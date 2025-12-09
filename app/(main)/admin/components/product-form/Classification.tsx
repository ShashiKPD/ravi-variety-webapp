"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Layers, Box } from "lucide-react";
import { ExistingGroup } from "./types";

type Props = {
  mode: 'new' | 'existing';
  brands: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  existingGroups: ExistingGroup[];
  brandId: string;
  setBrandId: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  selectedGroupId: string;
  setSelectedGroupId: (val: string) => void;
};

export default function Classification({
  mode, brands, categories, existingGroups,
  brandId, setBrandId, categoryId, setCategoryId,
  selectedGroupId, setSelectedGroupId
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return [];
    const lowerTerm = searchTerm.toLowerCase();
    
    return existingGroups.filter(g => 
      g.name.toLowerCase().includes(lowerTerm) || 
      g.brandName.toLowerCase().includes(lowerTerm) ||
      g.skus.toLowerCase().includes(lowerTerm) 
    ).slice(0, 5);
  }, [searchTerm, existingGroups]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <Layers className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {mode === 'new' ? "Family Classification" : "Select Parent Family"}
        </h3>
      </div>
      
      <div className="p-4 sm:p-6">
        {mode === 'new' ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger className="w-full bg-white text-sm"><SelectValue placeholder="Select Brand" /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full bg-white text-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
           </div>
        ) : (
           <div className="space-y-4 max-w-2xl">
             <div className="space-y-2">
               <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Search Existing Product Family</Label>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                 <Input 
                   placeholder="Type name, brand, or SKU..." 
                   value={searchTerm}
                   onChange={(e) => { setSearchTerm(e.target.value); setSelectedGroupId(""); }}
                   className="pl-9 bg-white placeholder:text-xs sm:placeholder:text-sm"
                 />
                 
                 {/* Dropdown Results */}
                 {searchTerm && !selectedGroupId && filteredGroups.length > 0 && (
                   <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                     {filteredGroups.map(g => (
                       <button
                         key={g.id} 
                         type="button"
                         onClick={() => {
                            setSelectedGroupId(String(g.id));
                            setSearchTerm(g.name);
                         }}
                         className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors group"
                       >
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{g.name}</div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                            <span className="bg-gray-100 px-1.5 rounded text-gray-600 group-hover:bg-blue-100/50">{g.brandName}</span>
                            {g.skus && <span className="truncate max-w-[200px] font-mono text-[10px] text-gray-400">SKUs: {g.skus}</span>}
                          </div>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>

             {/* Selected State */}
             {selectedGroupId && (
               <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-3 border border-green-200">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Box className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs text-green-600 font-medium uppercase">Selected Family</span>
                    <strong className="block text-green-900">{existingGroups.find(g => String(g.id) === selectedGroupId)?.name}</strong>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setSelectedGroupId(""); setSearchTerm(""); }} 
                    className="text-xs font-medium underline hover:text-green-900 px-2 py-1"
                  >
                    Change
                  </button>
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
}