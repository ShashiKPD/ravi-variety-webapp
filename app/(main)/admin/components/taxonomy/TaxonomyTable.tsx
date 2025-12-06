"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link"; // Added Link
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // Added Switch
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Loader2, Users, Lock, Unlock } from "lucide-react"; // Added Icons

type Item = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  is_restricted?: boolean; // Optional, only for Brands
};

type Props = {
  data: Item[];
  type: "Brand" | "Category";
  onDelete: (id: number) => Promise<any>;
  onUpdate: (formData: FormData) => Promise<any>;
  // Optional prop for toggling restriction
  onToggleRestriction?: (id: number, val: boolean) => Promise<any>;
};

export default function TaxonomyTable({ data, type, onDelete, onUpdate, onToggleRestriction }: Props) {
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
    // Optimistic toggle could be added here, but for now we wait
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
            {/* Show extra column only for Brands */}
            {type === 'Brand' && <TableHead>Access</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={type === 'Brand' ? 5 : 4} className="text-center text-gray-500 py-8">
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
                
                {/* RESTRICTION TOGGLE (Only for Brands) */}
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
                  
                  {/* MANAGE USERS BUTTON (Only if Restricted) */}
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

      {/* Edit Modal (Existing code) */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {type}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form action={async (formData) => {
                await onUpdate(formData);
                setEditingItem(null);
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingItem.id} />
              <div className="space-y-2">
                <Input name="name" defaultValue={editingItem.name} placeholder="Name" required />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Update Image (Optional)</p>
                <Input name="image" type="file" accept="image/*" />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}