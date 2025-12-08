import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditUserForm from "../../../components/users/EditUserForm"; // Check this path

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [profileRes, orderRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", id)
  ]);

  if (profileRes.error || !profileRes.data) {
    return notFound();
  }

  const orderCount = orderRes.count || 0;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-5 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <Button variant="ghost" asChild className="-ml-3 pl-3 gap-2 text-gray-500 hover:text-gray-900 active:scale-95 transition-all w-fit">
          <Link href={`/admin/users/${id}`}>
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
        </Button>
        <div className="mt-1 sm:mt-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Edit User</h1>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
            Update details for <span className="font-medium text-gray-700">{profileRes.data.full_name}</span>
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Profile Information
          </h2>
        </div>
        
        {/* CHANGED: Reduced padding on mobile (p-4) vs desktop (sm:p-6) */}
        <div className="p-4 sm:p-6">
          <EditUserForm user={profileRes.data} orderCount={orderCount} />
        </div>
      </div>

    </div>
  );
}