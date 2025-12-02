"use client";

import { useState, useRef } from "react";
import Image from "next/image"; // Import Image
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Trash2, AlertTriangle, Ban, CheckCircle, Info, Camera, User } from "lucide-react";
import { updateUserProfile, deleteUser, toggleUserStatus, adminUploadAvatar } from "../../users/actions";

type ProfileData = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  phone: string | null;
  address_text: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean | null;
  avatar_url: string | null; // Added avatar_url
};

export default function EditUserForm({ user, orderCount }: { user: ProfileData, orderCount: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // New state
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // --- AVATAR HANDLER ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("target_user_id", user.id); // Send ID of user being edited
    formData.append("avatar", e.target.files[0]);

    const res = await adminUploadAvatar(formData);
    setIsUploading(false);

    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const res = await updateUserProfile(formData);
    
    if (res.error) {
      alert(res.error);
      setIsLoading(false);
    } else {
      router.push(`/admin/users/${user.id}`);
      router.refresh(); 
    }
  };

  const handleToggleStatus = async () => {
    const isActive = user.is_active !== false;
    const action = isActive ? "Disable" : "Enable";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    setIsToggling(true);
    const res = await toggleUserStatus(user.id, isActive);
    setIsToggling(false);
    if (res?.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete ${user.full_name}? \n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    const res = await deleteUser(user.id);

    if (res?.error) {
      alert(res.error);
      setIsDeleting(false);
    } else {
      router.push("/admin/users");
      router.refresh();
    }
  };

  const isActive = user.is_active !== false;
  const hasOrders = orderCount > 0;

  return (
    <div className="space-y-8">
      
      {/* --- AVATAR SECTION --- */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        <div 
          className="relative group cursor-pointer" 
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 relative">
            {user.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <User className="w-10 h-10" />
              </div>
            )}
            
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            
            {/* Hover Overlay */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
            )}
          </div>
          
          {/* Edit Icon Badge */}
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm group-hover:bg-blue-700">
            <Camera className="w-3 h-3" />
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange} 
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-500">Click the image to upload a new photo.</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="id" value={user.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" defaultValue={user.full_name || ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={user.role || "retailer"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retailer">Retailer</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-600">Login ID (Phone)</Label>
            <Input 
              id="phone" 
              value={user.phone || ""} 
              disabled 
              className="bg-gray-100 text-gray-500 cursor-not-allowed" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Set New Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Leave blank to keep current" 
              minLength={6}
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address (Invoices)</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            defaultValue={user.email || ""} 
            placeholder="billing@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Textarea 
            id="address" 
            name="address_text" 
            defaultValue={user.address_text || ""} 
            className="min-h-[100px]" 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" name="latitude" type="number" step="any" defaultValue={user.latitude || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" name="longitude" type="number" step="any" defaultValue={user.longitude || ""} />
          </div>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            disabled={isLoading || isDeleting || isToggling}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || isDeleting || isToggling} 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-12 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Ban className="w-4 h-4" /> Account Access
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {isActive ? "User has full access." : "User is currently banned."}
            </p>
          </div>
          <Button 
            type="button" 
            variant={isActive ? "secondary" : "default"}
            onClick={handleToggleStatus}
            disabled={isToggling || isLoading}
            className={`w-full sm:w-auto ${!isActive && "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : isActive ? "Disable Account" : "Enable Account"}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Delete Data
            </h3>
            <div className="text-xs text-red-700 mt-1">
              {hasOrders ? (
                <span className="flex items-center gap-1 font-medium bg-red-100 w-fit px-2 py-1 rounded mt-1">
                  <Info className="w-3 h-3" /> Cannot delete: User has {orderCount} existing orders.
                </span>
              ) : (
                "Permanently delete user. This action cannot be undone."
              )}
            </div>
          </div>
          <Button 
            type="button" 
            onClick={handleDelete}
            disabled={isDeleting || isLoading || hasOrders}
            style={{ backgroundColor: hasOrders ? undefined : '#dc2626', color: 'white' }}
            className={`w-full sm:w-auto ${hasOrders ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}