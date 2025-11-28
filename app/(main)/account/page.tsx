import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "../components/account/AccountForm";
import { Card, CardContent } from "@/components/ui/card";

export default async function AccountPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div className="p-8 text-center">Profile not found. Please contact support.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
      
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6">
          <AccountForm user={profile} />
        </CardContent>
      </Card>
    </div>
  );
}