import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddUnitForm from "../../components/AddUnitForm";
import BackButton from "@/app/(main)/components/BackButton";
import UnitList from "../../components/UnitList"; // We'll make this simple component

export default async function ManageUnitsPage() {
  const supabase = await createClient();
  const { data: units } = await supabase.from("units").select("*").order("name");

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <BackButton href="/admin" label="Back to Dashboard" />
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Units</CardTitle>
          <CardDescription>Define selling units (e.g., Box, Kg) for your products.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddUnitForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Existing Units</CardTitle></CardHeader>
        <CardContent>
          <UnitList units={units || []} />
        </CardContent>
      </Card>
    </div>
  );
}