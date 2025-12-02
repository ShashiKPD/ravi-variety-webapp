import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TaxonomyForm from "../../components/taxonomy/TaxonomyForm";
import TaxonomyTable from "../../components/taxonomy/TaxonomyTable";
import { createCategory, updateCategory, deleteCategory } from "../actions";
import BackButton from "@/app/(main)/components/BackButton";

export default async function ManageCategoriesPage() {
  const supabase = await createClient();
  
  // Fetch existing categories with images
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <BackButton href="/admin" label="Back to Dashboard" />
      
      {/* Create Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Add new categories with images to organize your catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Reusing Shared Component */}
          <TaxonomyForm type="Category" onSubmit={createCategory} />
        </CardContent>
      </Card>

      {/* List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Reusing Shared Table */}
          <TaxonomyTable 
            data={categories || []} 
            type="Category" 
            onDelete={deleteCategory}
            onUpdate={updateCategory}
          />
        </CardContent>
      </Card>
    </div>
  );
}