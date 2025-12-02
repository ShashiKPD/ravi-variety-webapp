"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { addUnit } from "../units/actions";

export default function AddUnitForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await addUnit(formData);
    setLoading(false);
    if (res.error) alert(res.error);
    else {
      // Reset form manually or refresh
      (document.getElementById("unit-form") as HTMLFormElement).reset();
    }
  }

  return (
    <form id="unit-form" action={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input name="name" placeholder="e.g. CARTON" required className="uppercase" />
      </div>
      <div>
        <Label htmlFor="short_name">Display Shortname</Label>
        <Input name="short_name" placeholder="e.g. Ctn" required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
        Add Unit
      </Button>
    </form>
  );
}