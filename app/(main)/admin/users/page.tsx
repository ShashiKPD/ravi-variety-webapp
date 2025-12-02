import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image"; // Added Image import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, UserPlus, Ban, User } from "lucide-react"; // Added User icon
import BackButton from "@/app/(main)/components/BackButton";

export default async function UsersPage() {
  const supabase = await createClient();
  
  // Added avatar_url to select
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    return <p>Error loading users.</p>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <BackButton href="/admin" label="Back to Dashboard" />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" /> Create User
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead> {/* Renamed from Full Name */}
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles && profiles.length > 0 ? (
                profiles.map((profile) => {
                  // Determine status style
                  const isActive = profile.is_active !== false; // Default to true if null
                  
                  return (
                    <TableRow 
                      key={profile.id} 
                      className={`group ${!isActive ? "bg-red-50/50 hover:bg-red-50" : ""}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* AVATAR DISPLAY */}
                          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            {profile.avatar_url ? (
                              <Image 
                                src={profile.avatar_url} 
                                alt={profile.full_name} 
                                fill 
                                className="object-cover" 
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full text-gray-400">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                          </div>

                          {/* NAME & STATUS */}
                          <div>
                            <div className={`font-medium ${!isActive ? "text-gray-500" : "text-gray-900"}`}>
                              {profile.full_name}
                            </div>
                            {!isActive && (
                              <Badge variant="destructive" className="h-4 px-1 text-[9px] flex w-fit items-center gap-1 mt-0.5">
                                <Ban className="w-3 h-3" /> Disabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="capitalize bg-white">
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{profile.email || "-"}</TableCell>
                      <TableCell className="text-gray-600">{profile.phone || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/users/${profile.id}`}>
                            <Eye className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-600" /> 
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}