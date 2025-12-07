"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added Label import
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"; // Added Select components
import { Edit, Trash2, Loader2, Users, Lock, Unlock } from "lucide-react";

type Item = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  is_restricted?: boolean;
  supercategories?: { id: number; name: string } | null; // Nested relation from DB
  supercategory_id?: number | null; // Direct ID
};

type Props = {
  data: Item[];
  type: "Brand" | "Category" | "Supercategory";
  parents?: { id: number; name: string }[]; // Optional list of available parents
  onDelete: (id: number) => Promise<any>;
  onUpdate: (formData: FormData) => Promise<any>;
  onToggleRestriction?: (id: number, val: boolean) => Promise<any>;
};

export default function TaxonomyTable({ data, type, parents, onDelete, onUpdate, onToggleRestriction }: Props) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    setLoadingId(id);
    const res = await onDelete(id);
    setLoadingId(null);
    if (res?.error) alert(res.error);
  };

  const handleToggle = async (id: number, currentVal: boolean) => {
    if (!onToggleRestriction) return;
    const res = await onToggleRestriction(id, !currentVal);
    if (res?.error) alert(res.error);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            {/* Show Parent Column for Categories */}
            {type === 'Category' && <TableHead>Parent Group</TableHead>}
            {type === 'Brand' && <TableHead>Access</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={type === 'Category' || type === 'Brand' ? 5 : 4} className="text-center text-gray-500 py-8">
                No {type.toLowerCase()}s found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative w-10 h-10 rounded border bg-white overflow-hidden">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px] text-gray-400">No Img</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-gray-500 font-mono text-xs">{item.slug}</TableCell>
                
                {/* Parent Group Column */}
                {type === 'Category' && (
                  <TableCell className="text-sm text-gray-600">
                    {item.supercategories?.name || <span className="text-gray-400 italic">None</span>}
                  </TableCell>
                )}

                {/* Brand Restriction Toggle */}
                {type === 'Brand' && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Switch 
                         checked={item.is_restricted || false}
                         onCheckedChange={() => handleToggle(item.id, item.is_restricted || false)}
                         className="scale-75 data-[state=checked]:bg-amber-600"
                       />
                       {item.is_restricted ? (
                         <span className="text-xs font-medium text-amber-700 flex items-center gap-1"><Lock className="w-3 h-3" /> Restricted</span>
                       ) : (
                         <span className="text-xs text-gray-400 flex items-center gap-1"><Unlock className="w-3 h-3" /> Open</span>
                       )}
                    </div>
                  </TableCell>
                )}

                <TableCell className="text-right space-x-1">
                  {type === 'Brand' && item.is_restricted && (
                    <Button variant="outline" size="sm" asChild className="h-8 gap-2 mr-2 text-amber-700 border-amber-200 hover:bg-amber-50">
                      <Link href={`/admin/brands/${item.id}/access`}>
                        <Users className="w-3.5 h-3.5" /> Users
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(item.id)}
                    disabled={loadingId === item.id}
                  >
                    {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-600" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {type}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form action={async (formData) => {
                // Handle "None" selection (value="0")
                if (formData.get("supercategory_id") === "0") {
                  formData.delete("supercategory_id");
                }
                const res = await onUpdate(formData);
                if (res?.error) alert(res.error);
                else setEditingItem(null);
            }} className="space-y-4">
              
              <input type="hidden" name="id" value={editingItem.id} />
              
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={editingItem.name} placeholder="Name" required />
              </div>

              {/* PARENT SELECTOR IN EDIT MODE */}
              {parents && parents.length > 0 && (
                <div className="space-y-2">
                  <Label>Parent Supercategory</Label>
                  <Select name="supercategory_id" defaultValue={String(editingItem.supercategory_id || editingItem.supercategories?.id || "0")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0" className="text-gray-500">None (Top Level)</SelectItem>
                      {parents.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Update Image (Optional)</Label>
                <Input name="image" type="file" accept="image/*" />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}