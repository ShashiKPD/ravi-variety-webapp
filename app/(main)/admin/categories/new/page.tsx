import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TaxonomyForm from "../../components/taxonomy/TaxonomyForm";
import TaxonomyTable from "../../components/taxonomy/TaxonomyTable";
import { createCategory, updateCategory, deleteCategory } from "../actions";
import BackButton from "@/app/(main)/components/BackButton";

export default async function ManageCategoriesPage() {
  const supabase = await createClient();
  
  // 1. Fetch Categories AND Supercategories
  const [categoriesRes, supercatsRes] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("supercategories").select("id, name").order("name")
  ]);

  const categories = categoriesRes.data || [];
  const supercategories = supercatsRes.data || [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <BackButton href="/admin" label="Back to Dashboard" />
      
      {/* Create Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Add new categories and link them to supercategories (optional).</CardDescription>
        </CardHeader>
        <CardContent>
          <TaxonomyForm 
            type="Category" 
            onSubmit={createCategory}
            parents={supercategories} // <--- Pass supercategories here
          />
        </CardContent>
      </Card>

      {/* List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <TaxonomyTable 
            data={categories} 
            type="Category" 
            onDelete={deleteCategory}
            onUpdate={updateCategory}
          />
        </CardContent>
      </Card>
    </div>
  );
}