"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUnit } from "../units/actions";

export default function UnitList({ units }: { units: any[] }) {
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this unit?")) return;
    const res = await deleteUnit(id);
    if (res.error) alert(res.error);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {units.map((u) => (
        <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border text-sm">
          <div>
            <p className="font-bold text-gray-900">{u.short_name}</p>
            <p className="text-[10px] text-gray-500">{u.name}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => handleDelete(u.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}