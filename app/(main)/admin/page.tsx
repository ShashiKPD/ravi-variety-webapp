import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Users, FolderKanban, Tag } from "lucide-react";
import Link from "next/link";

// This is a simple Server Component.
// Our proxy.ts already protects it.
export default function AdminDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- Product Management Card (Modified) --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Management</CardTitle>
            <Package className="h-6 w-6 text-gray-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add new products and edit existing items in your catalog.
            </CardDescription>
            <Button asChild>
              <Link href="/admin/products/new">Add New Product</Link>
            </Button>
            {/* "View All Products" link can go here later */}
          </CardContent>
        </Card>

        {/* --- User Management Card (Unchanged) --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Users className="h-6 w-6 text-gray-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Create new user accounts and view all existing users.
            </CardDescription>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/admin/users/new">Create New User</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/users">View All Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- Category Management Card (NEW) --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Category Management</CardTitle>
            <FolderKanban className="h-6 w-6 text-gray-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add new categories to be used for products and filtering.
            </CardDescription>
            <Button asChild>
              <Link href="/admin/categories/new">Manage Categories</Link>
            </Button>
          </CardContent>
        </Card>
        {/* --- NEW: Brand Management Card --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Brand Management</CardTitle>
            <Tag className="h-6 w-6 text-gray-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Add and manage the brands you distribute.
            </CardDescription>
            <Button asChild>
              <Link href="/admin/brands/new">Manage Brands</Link>
            </Button>
          </CardContent>
        </Card>

        {/* --- Analytics Card (Modified) --- */}
        <Card> {/* Removed md:col-span-2 */}
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Analytics and reporting will be available here soon.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}