import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddBrandForm from "../../components/AddBrandForm";
import { createClient } from "@/utils/supabase/server";

export default async function ManageBrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase.from("brands").select("name");

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Brands</CardTitle>
          <CardDescription>
            Add one or more new brands to your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddBrandForm />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Existing Brands</CardTitle>
        </CardHeader>
        <CardContent>
          {brands && brands.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <span
                  key={b.name}
                  className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full border border-blue-200"
                >
                  {b.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No brands found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}