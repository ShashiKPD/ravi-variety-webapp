import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TaxonomyForm from "../../components/taxonomy/TaxonomyForm";
import TaxonomyTable from "../../components/taxonomy/TaxonomyTable";
import { createSupercategory, updateSupercategory, deleteSupercategory } from "../actions";
import BackButton from "@/app/(main)/components/BackButton";

export default async function ManageSupercategoriesPage() {
  const supabase = await createClient();
  
  // Fetch existing supercategories with images
  const { data: supercategories } = await supabase
    .from("supercategories")
    .select("*")
    .order("name");

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      
      <BackButton href="/admin" label="Back to Dashboard" />

      {/* Create Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Supercategories</CardTitle>
          <CardDescription>
            Create top-level groups (e.g., "Groceries", "Household") to organize your categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We reuse 'Category' type label for UI consistency, but pass the specific actions */}
          <TaxonomyForm 
            type="Supercategory" 
            onSubmit={createSupercategory} 
            // No parents needed for supercategories (they are top level)
          />
        </CardContent>
      </Card>

      {/* List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Supercategories</CardTitle>
        </CardHeader>
        <CardContent>
          <TaxonomyTable 
            data={supercategories || []} 
            type="Supercategory" 
            onDelete={deleteSupercategory}
            onUpdate={updateSupercategory}
          />
        </CardContent>
      </Card>
    </div>
  );
}