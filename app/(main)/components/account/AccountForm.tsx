"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Camera, Save, Edit2, Phone, Mail, User, Lock, Info } from "lucide-react";
import { updateAccountDetails, uploadAvatar } from "@/app/(main)/account/actions"; 
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ProfileData = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address_text: string | null;
  latitude: number | null;
  longitude: number | null;
  avatar_url: string | null;
  role: string | null;
};

export default function AccountForm({ user }: { user: ProfileData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleProfileUpdate = async (formData: FormData) => {
    setIsLoading(true);
    const res = await updateAccountDetails(formData);
    setIsLoading(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Contact details updated");
      setIsEditing(false);
      router.refresh();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", e.target.files[0]);

    const res = await uploadAvatar(formData);
    setIsUploading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Profile photo updated");
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. HEADER & AVATAR */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          
          {/* Avatar Area */}
          <div 
            className={`relative group shrink-0 ${isEditing ? "cursor-pointer" : ""}`} 
            onClick={() => isEditing && fileInputRef.current?.click()}
          >
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50 relative transition-all ${isEditing ? "group-hover:border-blue-100" : ""}`}>
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <User className="w-10 h-10" />
                </div>
              )}
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white z-20">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>
            
            {/* Edit Badge (Only if Editing) */}
            {isEditing && (
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-sm z-10 active:scale-90 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              disabled={!isEditing}
            />
          </div>
          
          <div className="text-center sm:text-left space-y-1 mt-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.full_name || "Guest User"}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge variant="secondary" className="capitalize bg-gray-100 text-gray-600 border-gray-200">
                {user.role || "Retailer"} Account
              </Badge>
            </div>
            <p className="text-sm font-mono text-gray-400 pt-1">{user.phone}</p>
          </div>
        </div>

        {/* Edit Toggle */}
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        )}
      </div>

      {/* 2. FORM CONTENT */}
      {isEditing ? (
        
        <form action={handleProfileUpdate} className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Identity & Contact */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Identity & Contact
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LOCKED: Full Name */}
              <div className="space-y-1.5 opacity-70">
                <Label htmlFor="full_name" className="flex items-center gap-1.5">
                  Business Name <Lock className="w-3 h-3 text-gray-400" />
                </Label>
                <Input value={user.full_name || ""} disabled className="bg-gray-50 border-gray-200 cursor-not-allowed" />
              </div>

              {/* LOCKED: Phone */}
              <div className="space-y-1.5 opacity-70">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  Login Phone <Lock className="w-3 h-3 text-gray-400" />
                </Label>
                <Input value={user.phone || ""} disabled className="bg-gray-50 border-gray-200 cursor-not-allowed" />
              </div>

              {/* EDITABLE: Email */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="email" className="text-blue-600 font-semibold">Email Address (For Invoices)</Label>
                <Input 
                  name="email" 
                  defaultValue={user.email || ""} 
                  placeholder="billing@example.com" 
                  className="bg-white border-blue-200 focus-visible:ring-blue-500" 
                />
              </div>
            </div>
          </div>

          {/* Location Info (ALL LOCKED) */}
          <div className="space-y-4 opacity-70 grayscale-[0.5]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              Delivery Location <Lock className="w-3 h-3" />
            </h3>
            
            <div className="space-y-4 pointer-events-none">
              <div className="space-y-1.5">
                <Label htmlFor="address">Full Address</Label>
                <Textarea 
                  defaultValue={user.address_text || ""} 
                  readOnly
                  className="min-h-24 bg-gray-50 border-gray-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Latitude</Label>
                  <Input value={user.latitude || ""} readOnly className="bg-gray-50 border-gray-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Longitude</Label>
                  <Input value={user.longitude || ""} readOnly className="bg-gray-50 border-gray-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              To prevent delivery issues, business name and location details cannot be changed online. 
              Please contact <span className="font-semibold">Support</span> if you need to move your shop location.
            </p>
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="w-full sm:w-auto active:scale-95 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>

      ) : (

        /* --- READ ONLY VIEW --- */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Contact Details</h3>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Primary Mobile (Login)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.email || "Not provided"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Billing Email</p>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Shipping Address</h3>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-red-50 rounded-full text-red-600 mt-1">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-line leading-relaxed">
                    {user.address_text || "No address on file."}
                  </p>
                  {(user.latitude || user.longitude) && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {user.latitude}, {user.longitude}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}