"use client";

import { useState } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 

type Item = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  supercategories?: { id: number; name: string } | null;
  supercategory_id?: number | null; 
};

type Props = {
  data: Item[];
  type: "Category" | "Supercategory"; // Removed "Brand"
  parents?: { id: number; name: string }[];
  onDelete: (id: number) => Promise<any>;
  onUpdate: (formData: FormData) => Promise<any>;
  // Removed onToggleRestriction prop
};

export default function TaxonomyTable({ data, type, parents, onDelete, onUpdate }: Props) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    setLoadingId(id);
    const res = await onDelete(id);
    setLoadingId(null);
    if (res?.error) toast.error(res.error);
    else toast.success("Deleted successfully");
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("image") as File;

    if (formData.get("supercategory_id") === "0") {
      formData.delete("supercategory_id");
    }

    try {
      let uploadedUrl = "";

      if (imageFile && imageFile.size > 0) {
        if (imageFile.size > MAX_FILE_SIZE) throw new Error("Image too large. Max size is 5MB.");

        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop();
        const folder = `${type.toLowerCase()}s`;
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) throw new Error("Image upload failed");

        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        uploadedUrl = data.publicUrl;
      }

      formData.delete("image");
      if (uploadedUrl) {
        formData.append("image_url", uploadedUrl);
      }

      const res = await onUpdate(formData);

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${type} updated successfully`);
        setEditingItem(null);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px] sm:min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                {type === 'Category' && <TableHead>Parent Group</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No {type.toLowerCase()}s found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
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
                    <TableCell className="text-muted-foreground font-mono text-xs">{item.slug}</TableCell>
                    
                    {type === 'Category' && (
                      <TableCell className="text-sm">
                        {item.supercategories?.name || <span className="text-muted-foreground/50 italic">None</span>}
                      </TableCell>
                    )}

                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setEditingItem(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(item.id)}
                          disabled={loadingId === item.id}
                        >
                          {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-[90%] sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit {type}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <input type="hidden" name="id" value={editingItem.id} />
              
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={editingItem.name} required />
              </div>

              {parents && parents.length > 0 && (
                <div className="space-y-2">
                  <Label>Parent Supercategory</Label>
                  <Select name="supercategory_id" defaultValue={String(editingItem.supercategory_id || editingItem.supercategories?.id || "0")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0" className="text-muted-foreground">None (Top Level)</SelectItem>
                      {parents.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Update Image</Label>
                <Input name="image" type="file" accept="image/*" />
                <span className="text-[10px] text-muted-foreground">Max 5MB</span>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}