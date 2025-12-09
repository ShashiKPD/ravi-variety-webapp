import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "../../components/account/AccountForm"; 
import BackButton from "../../components/BackButton";

export default async function AccountSettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/account" label="Back to Hub" />
        <div className="mt-1 sm:mt-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage your profile and delivery preferences.</p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Profile Details
          </h2>
        </div>
        
        <div className="p-4 sm:p-6">
          <AccountForm user={profile} />
        </div>
      </div>

    </div>
  );
}