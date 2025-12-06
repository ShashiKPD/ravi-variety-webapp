import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck } from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";
import AccessList from "./AccessList"; // Client Component

export default async function BrandAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Brand Info
  const { data: brand } = await supabase.from("brands").select("name").eq("id", id).single();
  if (!brand) notFound();

  // 2. Fetch Users
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone")
    .order("full_name");

  // 3. Fetch Existing Permissions
  const { data: permissions } = await supabase
    .from("brand_access_permissions")
    .select("user_id")
    .eq("brand_id", id);
    
  const permittedUserIds = new Set(permissions?.map(p => p.user_id));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      <BackButton href="/admin/brands/new" label="Back to Brands" />

      <div className="flex flex-col gap-1">
         <h1 className="text-2xl font-bold text-gray-900">Manage Access: {brand.name}</h1>
         <p className="text-gray-500">Select retailers who can view pricing and purchase this brand.</p>
      </div>

      <Card>
        <CardHeader className="bg-amber-50/50 border-b">
          <div className="flex items-center gap-2 text-amber-700">
             <ShieldCheck className="w-5 h-5" />
             <CardTitle className="text-base">Permission Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AccessList 
            brandId={Number(id)} 
            users={users || []} 
            initialPermissions={permittedUserIds} 
          />
        </CardContent>
      </Card>
    </div>
  );
}