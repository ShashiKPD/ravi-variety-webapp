import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "../../components/account/AccountForm"; // Update import path if needed
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AccountSettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div className="p-8 text-center">Profile not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4 pl-0 text-gray-500 hover:text-gray-900">
        <Link href="/account">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Account
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
      
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6">
          <AccountForm user={profile} />
        </CardContent>
      </Card>
    </div>
  );
}