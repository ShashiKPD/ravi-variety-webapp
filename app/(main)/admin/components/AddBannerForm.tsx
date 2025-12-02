"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { uploadBanner } from "../banners/actions";

export default function AddBannerForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    // 1. Client-Side Validation
    const file = formData.get("image") as File;
    
    if (file && file.size > 5 * 1024 * 1024) { // 5MB in bytes
      alert("File is too large. Maximum allowed size is 5MB.");
      return;
    }

    setLoading(true);
    const res = await uploadBanner(formData);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      (document.getElementById("banner-form") as HTMLFormElement).reset();
    }
  }

  return (
    <form id="banner-form" action={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="image">Banner Image (Max 5MB)</Label>
        <Input name="image" type="file" accept="image/*" required />
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input name="title" placeholder="e.g. Summer Sale" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        Upload
      </Button>
    </form>
  );
}