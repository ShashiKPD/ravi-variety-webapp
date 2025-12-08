import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BackButton from "@/app/(main)/components/BackButton";
import AppSettingsCard from "../components/admin/AppSettingsCard"; // Using the component we created

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch Settings
  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .order("key");

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin" label="Back to Dashboard" />
        <div className="mt-1 sm:mt-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">System Configuration</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage global application variables and constants.</p>
        </div>
      </div>

      {/* Settings List */}
      <AppSettingsCard settings={settings || []} />
    </div>
  );
}