"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { toggleUserBrandAccess } from "../../actions"; // Import from brands/actions.ts

type User = {
  id: string;
  full_name: string | null;
  role: string | null;
  phone: string | null;
};

export default function AccessList({ brandId, users, initialPermissions }: { brandId: number, users: User[], initialPermissions: Set<string> }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState(initialPermissions);

  const handleToggle = async (userId: string, checked: boolean) => {
    // Optimistic Update
    const next = new Set(permissions);
    if (checked) next.add(userId);
    else next.delete(userId);
    setPermissions(next);

    // Server Action
    const res = await toggleUserBrandAccess(brandId, userId, checked);
    if (res.error) {
      alert(res.error);
      // Revert if error
      setPermissions(initialPermissions); 
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search users by name or phone..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          filteredUsers.map((user) => {
            const hasAccess = permissions.has(user.id);
            return (
              <div key={user.id} className={`flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50 transition-colors ${hasAccess ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={user.id} 
                    checked={hasAccess}
                    onCheckedChange={(checked) => handleToggle(user.id, checked as boolean)}
                  />
                  <div>
                    <label htmlFor={user.id} className="font-medium text-gray-900 cursor-pointer select-none">
                      {user.full_name}
                    </label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize text-gray-500">{user.role}</Badge>
                      <span className="text-xs text-gray-400 font-mono">{user.phone}</span>
                    </div>
                  </div>
                </div>
                {hasAccess && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Allowed</Badge>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}