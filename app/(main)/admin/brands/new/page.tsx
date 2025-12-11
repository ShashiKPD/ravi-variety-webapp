import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BrandForm from "../../components/brands/BrandForm";
import BrandTable from "../../components/brands/BrandTable";
import { createBrand, updateBrand, deleteBrand, toggleBrandRestriction } from "../actions"; 
import BackButton from "@/app/(main)/components/BackButton";

export default async function ManageBrandsPage() {
  const supabase = await createClient();
  
  // Fetch Brands with their Categories
  const { data: brands } = await supabase
    .from("brands")
    .select("*, brand_categories(category_id)")
    .order("name");

  // Fetch Categories for the dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <BackButton href="/admin" label="Back to Dashboard" />
      
      <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
        
        {/* Left: Create Form */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Brands</h1>
            <p className="text-sm text-gray-500 mt-1">Configure brands and access.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Brand</CardTitle>
              <CardDescription>Link it to relevant categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandForm categories={categories || []} onSubmit={createBrand} />
            </CardContent>
          </Card>
        </div>

        {/* Right: List */}
        <Card className="lg:mt-14">
          <CardHeader>
            <CardTitle>Existing Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandTable 
              data={brands || []} 
              categories={categories || []}
              onDelete={deleteBrand}
              onUpdate={updateBrand}
              onToggleRestriction={toggleBrandRestriction}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}