"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Loader2, Users, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import BrandForm from "./BrandForm"; // Import the specific form

type Brand = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  is_restricted: boolean;
  brand_categories: { category_id: number }[]; // Relation
};

type Props = {
  data: Brand[];
  categories: { id: number; name: string }[];
  onDelete: (id: number) => Promise<any>;
  onUpdate: (formData: FormData) => Promise<any>;
  onToggleRestriction: (id: number, val: boolean) => Promise<any>;
};

export default function BrandTable({ data, categories, onDelete, onUpdate, onToggleRestriction }: Props) {
  const [editingItem, setEditingItem] = useState<Brand | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    setLoadingId(id);
    const res = await onDelete(id);
    setLoadingId(null);
    if (res?.error) toast.error(res.error);
    else toast.success("Deleted");
  };

  const handleToggle = async (id: number, currentVal: boolean) => {
    const res = await onToggleRestriction(id, !currentVal);
    if (res?.error) toast.error(res.error);
    else toast.success("Access updated");
  };

  // Helper to resolve category names from IDs
  const getCategoryNames = (ids: number[]) => {
    return ids.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(", ");
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Brand Name</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="relative w-10 h-10 rounded border bg-white overflow-hidden">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-contain p-0.5" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[10px] text-gray-400">N/A</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                    {getCategoryNames(item.brand_categories.map(bc => bc.category_id)) || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Switch 
                          checked={item.is_restricted} 
                          onCheckedChange={() => handleToggle(item.id, item.is_restricted)}
                          className="scale-75 data-[state=checked]:bg-amber-600"
                        />
                        {item.is_restricted ? <Lock className="w-3 h-3 text-amber-700"/> : <Unlock className="w-3 h-3 text-gray-400"/>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.is_restricted && (
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-amber-700 hover:bg-amber-50">
                          <Link href={`/admin/brands/${item.id}/access`}><Users className="w-4 h-4" /></Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => setEditingItem(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" size="icon" 
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                        disabled={loadingId === item.id}
                      >
                        {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <BrandForm 
              categories={categories}
              initialData={editingItem}
              onSubmit={async (data) => {
                await onUpdate(data);
                setEditingItem(null); // Close on success
                return { success: "Updated" }; 
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}