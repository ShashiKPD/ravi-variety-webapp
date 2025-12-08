"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Trash2, AlertTriangle, Ban, CheckCircle, Info, Camera, User, Key, MapPin } from "lucide-react";
import { updateUserProfile, deleteUser, toggleUserStatus, adminUploadAvatar } from "@/app/(main)/admin/users/actions"; 
import { toast } from "sonner";

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
  avatar_url: string | null;
};

export default function EditUserForm({ user, orderCount }: { user: ProfileData, orderCount: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("target_user_id", user.id); 
    formData.append("avatar", e.target.files[0]);

    const res = await adminUploadAvatar(formData);
    setIsUploading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Avatar updated");
      router.refresh();
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const res = await updateUserProfile(formData);
    
    if (res.error) {
      toast.error(res.error);
      setIsLoading(false);
    } else {
      toast.success("Saved successfully");
      router.push(`/admin/users/${user.id}`);
      router.refresh(); 
    }
  };

  const handleToggleStatus = async () => {
    const isActive = user.is_active !== false;
    if (isActive && !confirm(`Disable user? They won't be able to login.`)) return;

    setIsToggling(true);
    const res = await toggleUserStatus(user.id, isActive);
    setIsToggling(false);
    
    if (res?.error) toast.error(res.error);
    else {
      toast.success(`User ${isActive ? "disabled" : "enabled"}`);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${user.full_name}? This cannot be undone.`)) return;

    setIsDeleting(true);
    const res = await deleteUser(user.id);

    if (res?.error) {
      toast.error(res.error);
      setIsDeleting(false);
    } else {
      toast.success("User deleted");
      router.push("/admin/users");
      router.refresh();
    }
  };

  const isActive = user.is_active !== false;
  const hasOrders = orderCount > 0;

  return (
    // CHANGED: Reduced vertical space (space-y-5 on mobile, 8 on desktop)
    <div className="space-y-5 sm:space-y-8">
      
      {/* --- AVATAR SECTION --- */}
      {/* CHANGED: Tighter padding (pb-4) */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-100">
        <div 
          className="relative group cursor-pointer shrink-0" 
          onClick={() => fileInputRef.current?.click()}
        >
          {/* CHANGED: Smaller avatar on mobile (w-20 vs w-24) */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50 relative group-hover:border-blue-100 transition-all">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300"><User className="w-10 h-10" /></div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white z-20">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full border-2 border-white shadow-sm z-10">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
        </div>
        
        <div className="text-center sm:text-left space-y-1 sm:mt-2">
          <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-[200px] sm:max-w-xs mx-auto sm:mx-0">
            Tap image to upload. Max 5MB.
          </p>
          <div className="pt-1.5">
             {isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  <Ban className="w-3 h-3" /> Disabled
                </span>
              )}
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6 sm:space-y-8">
        <input type="hidden" name="id" value={user.id} />

        {/* --- IDENTITY --- */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-1.5">Identity</h4>
          {/* CHANGED: Tighter gap (gap-4) on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" defaultValue={user.full_name || ""} required className="bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={user.role || "retailer"}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="retailer">Retailer</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* --- CREDENTIALS --- */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-1.5">Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-gray-500 text-xs sm:text-sm">Login ID (Phone)</Label>
              <Input 
                id="phone" 
                value={user.phone || ""} 
                disabled 
                className="bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                defaultValue={user.email || ""} 
                className="bg-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="password">Reset Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="Enter new password" 
                  minLength={6}
                  className="bg-white pl-9"
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-gray-400">Leave blank to keep current.</p>
            </div>
          </div>
        </div>

        {/* --- ADDRESS --- */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-1.5">Location</h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address">Full Address</Label>
              <Textarea 
                id="address" 
                name="address_text" 
                defaultValue={user.address_text || ""} 
                className="min-h-[80px] bg-white resize-y text-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="latitude" className="text-xs text-gray-500">Latitude</Label>
                <Input id="latitude" name="latitude" type="number" step="any" defaultValue={user.latitude || ""} className="bg-white h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="longitude" className="text-xs text-gray-500">Longitude</Label>
                <Input id="longitude" name="longitude" type="number" step="any" defaultValue={user.longitude || ""} className="bg-white h-9 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* --- SAVE --- */}
        <div className="pt-4 sm:pt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            disabled={isLoading || isDeleting || isToggling}
            className="w-full sm:w-auto active:scale-95 transition-all"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || isDeleting || isToggling} 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>

      {/* --- DANGER ZONE --- */}
      {/* CHANGED: Reduced margin top (mt-8) and internal padding (p-3) */}
      <div className="border border-red-100 rounded-xl overflow-hidden bg-red-50/30 mt-8 sm:mt-12">
        <div className="px-4 py-2.5 sm:py-3 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h3 className="text-xs sm:text-sm font-bold text-red-900">Danger Zone</h3>
        </div>
        
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          {/* Status Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Account Status</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {isActive ? "Prevent login access." : "Restore login access."}
              </p>
            </div>
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={isToggling || isLoading}
              className="w-full sm:w-auto active:scale-95 transition-all h-8 text-xs"
            >
              {isToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : isActive ? "Disable" : "Enable"}
            </Button>
          </div>

          <div className="h-px bg-red-100/50 w-full" />

          {/* Delete User */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="text-sm font-medium text-red-900">Delete User</h4>
              <div className="text-xs text-red-700/80 mt-0.5">
                {hasOrders ? (
                  <span className="flex items-center gap-1 font-medium bg-red-100 w-fit px-1.5 py-0.5 rounded">
                    <Info className="w-3 h-3" /> Has {orderCount} orders.
                  </span>
                ) : (
                  "Permanently remove data."
                )}
              </div>
            </div>
            <Button 
              type="button" 
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || isLoading || hasOrders}
              className={`w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-transparent active:scale-95 transition-all h-8 text-xs ${hasOrders ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-2" />}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}