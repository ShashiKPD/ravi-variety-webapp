"use client";

import { useState } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Loader2, Save } from "lucide-react";

type Item = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

type Props = {
  data: Item[];
  type: "Brand" | "Category";
  onDelete: (id: number) => Promise<{ error?: string; success?: string }>; // Updated return type
  onUpdate: (formData: FormData) => Promise<any>;
};

export default function TaxonomyTable({ data, type, onDelete, onUpdate }: Props) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if(!confirm(`Are you sure you want to delete this ${type}?`)) return;
    setLoadingId(id);
    const res = await onDelete(id);
    setLoadingId(null);
    if (res?.error) {
      alert(res.error);
    }
  };
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500 py-8">No {type.toLowerCase()}s found.</TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative w-10 h-10 rounded border bg-white">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px] text-gray-400">No Img</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-gray-500 font-mono text-xs">{item.slug}</TableCell>
                <TableCell className="text-right space-x-2">
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