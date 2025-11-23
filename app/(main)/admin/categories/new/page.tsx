import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddCategoryForm from "../../components/AddCategoryForm";
import { createClient } from "@/utils/supabase/server";
import { Separator } from "@/components/ui/separator";

// This is a Server Component, so we can fetch data
export default async function AddCategoryPage() {

  // Fetch existing categories to show the admin
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("name");

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Add one or more new categories to your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddCategoryForm />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.name}
                  className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          ) : (
            <p>No categories found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}