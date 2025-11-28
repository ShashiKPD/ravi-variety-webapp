"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
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
      g.skus.toLowerCase().includes(lowerTerm) // <-- Search by SKU
    ).slice(0, 5);
  }, [searchTerm, existingGroups]);

  return (
    <Card className="border-l-4 border-l-slate-800 shadow-sm gap-2 py-6">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle className="text-base font-medium text-gray-900">
          {mode === 'new' ? "Define Product Family" : "Select Parent Family"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        
        {mode === 'new' ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Brand</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger className="w-full h-9 text-sm"><SelectValue placeholder="Select Brand" /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
             <div>
                <Label className="mb-1.5 block text-xs font-medium text-gray-600">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full h-9 text-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
           </div>
        ) : (
           <div className="space-y-4">
             <div>
               <Label className="mb-1.5 block text-xs font-medium text-gray-600">Search Existing Product Family</Label>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                 <Input 
                    placeholder="Type name or SKU..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setSelectedGroupId(""); }}
                    className="pl-9"
                 />
               </div>
               
               {searchTerm && !selectedGroupId && filteredGroups.length > 0 && (
                 <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredGroups.map(g => (
                      <div 
                        key={g.id} 
                        onClick={() => {
                           setSelectedGroupId(String(g.id));
                           setSearchTerm(g.name);
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                      >
                         <div className="text-sm font-medium text-gray-900">{g.name}</div>
                         <div className="flex justify-between items-center text-xs text-gray-500 mt-0.5">
                            <span>Brand: {g.brandName}</span>
                            {/* Display SKU match if relevant */}
                            {g.skus && <span className="text-gray-400 truncate max-w-[120px] ml-2">SKUs: {g.skus}</span>}
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>

             {selectedGroupId && (
               <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm flex items-center gap-2 border border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Selected: <strong>{existingGroups.find(g => String(g.id) === selectedGroupId)?.name}</strong>
                  <button type="button" onClick={() => { setSelectedGroupId(""); setSearchTerm(""); }} className="ml-auto text-xs underline">Change</button>
               </div>
             )}
           </div>
        )}
      </CardContent>
    </Card>
  );
}