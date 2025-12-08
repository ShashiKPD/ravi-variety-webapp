import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Search, Plus, User, Eye, Shield, Phone, Mail, Ban, CheckCircle 
} from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminUsersPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const supabase = await createClient();

  // 1. Build Query with Search
  let dbQuery = supabase
    .from("profiles")
    .select("*")
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,role.ilike.%${query}%`);
  }

  const { data: profiles, error } = await dbQuery;

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Helper: Role Badges
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 px-2">
            <Shield className="w-3 h-3" /> Admin
          </Badge>
        );
      case 'wholesaler':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-2">
            Wholesaler
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal px-2">
            Retailer
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin" label="Back to Dashboard" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">
              {profiles?.length || 0} active users
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto active:scale-95 transition-all shadow-sm">
            <Link href="/admin/users/new">
              <Plus className="w-4 h-4 mr-2" /> Create User
            </Link>
          </Button>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <form className="relative max-w-md w-full" method="GET">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input 
          name="q" 
          placeholder="Search name, email, or role..." 
          defaultValue={query}
          className="pl-9 bg-white w-full"
        />
      </form>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="w-16 pl-6">Avatar</TableHead>
              <TableHead>User Details</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles && profiles.length > 0 ? (
              profiles.map((user) => {
                const isActive = user.is_active !== false;

                return (
                  <TableRow key={user.id} className="hover:bg-gray-50/50 group">
                    {/* Avatar */}
                    <TableCell className="pl-6 py-3">
                      <div className="w-10 h-10 rounded-full border bg-gray-100 relative overflow-hidden flex items-center justify-center shrink-0">
                        {user.avatar_url ? (
                          <Image src={user.avatar_url} alt={user.full_name || ""} fill className="object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <div className="font-medium text-gray-900">{user.full_name || "Unknown User"}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5 opacity-50 hover:opacity-100 transition-opacity">
                        {user.id.slice(0, 8)}...
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        {user.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {user.phone}
                          </div>
                        )}
                        {!user.email && !user.phone && <span className="text-gray-400 italic text-xs">No info</span>}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {isActive ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full w-fit">
                          <Ban className="w-3 h-3" /> Disabled
                        </div>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right pr-6">
                      <Button asChild variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-blue-600 active:scale-95 transition-all">
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-8 h-8 text-gray-300" />
                    <p>No users found matching "{query}".</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden space-y-3">
        {profiles && profiles.length > 0 ? (
          profiles.map((user) => (
            <div key={user.id} className="bg-white border rounded-xl p-4 shadow-sm relative active:border-blue-300 transition-colors">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full border bg-gray-50 relative overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.full_name || ""} fill className="object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{user.full_name || "Unknown User"}</h3>
                      <div className="mt-1 flex gap-2">
                        {getRoleBadge(user.role)}
                        {user.is_active === false && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Disabled</Badge>
                        )}
                      </div>
                    </div>
                    {/* View Button */}
                    <Link 
                      href={`/admin/users/${user.id}`} 
                      className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full active:scale-90 transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1.5 pt-3 border-t border-gray-50">
                    {user.email ? (
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {user.email}
                      </div>
                    ) : null}
                    {user.phone ? (
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {user.phone}
                      </div>
                    ) : null}
                    
                    <div className="text-[10px] text-gray-400 mt-2 flex justify-between">
                      <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-dashed rounded-lg p-10 text-center text-gray-500">
            <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No users found.</p>
          </div>
        )}
      </div>

    </div>
  );
}