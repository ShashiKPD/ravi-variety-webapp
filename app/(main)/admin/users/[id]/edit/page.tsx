import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import EditUserForm from "../../../components/users/EditUserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Profile AND Order Count in parallel
  const [profileRes, orderRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", id)
  ]);

  if (profileRes.error || !profileRes.data) {
    return notFound();
  }

  const orderCount = orderRes.count || 0;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href={`/admin/users/${id}`}>
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-sm text-gray-500">Update account details for {profileRes.data.full_name}</p>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
          <CardTitle className="text-base font-medium text-gray-900">
            Profile Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Pass the order count to the form */}
          <EditUserForm user={profileRes.data} orderCount={orderCount} />
        </CardContent>
      </Card>
    </div>
  );
}