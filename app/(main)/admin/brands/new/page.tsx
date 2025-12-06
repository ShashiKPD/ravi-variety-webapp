import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TaxonomyForm from "../../components/taxonomy/TaxonomyForm";
import TaxonomyTable from "../../components/taxonomy/TaxonomyTable";
import { createBrand, updateBrand, deleteBrand, toggleBrandRestriction } from "../actions"; // Import toggle
import BackButton from "@/app/(main)/components/BackButton";

export default async function ManageBrandsPage() {
  const supabase = await createClient();
  // Fetch is_restricted
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <BackButton href="/admin" label="Back to Dashboard" />
      
      {/* Create Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Brands</CardTitle>
          <CardDescription>Add new brands. Toggle 'Restricted' to limit access.</CardDescription>
        </CardHeader>
        <CardContent>
          <TaxonomyForm type="Brand" onSubmit={createBrand} />
        </CardContent>
      </Card>

      {/* List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <TaxonomyTable 
            data={brands || []} 
            type="Brand" 
            onDelete={deleteBrand}
            onUpdate={updateBrand}
            onToggleRestriction={toggleBrandRestriction} // Pass it here
          />
        </CardContent>
      </Card>
    </div>
  );
}