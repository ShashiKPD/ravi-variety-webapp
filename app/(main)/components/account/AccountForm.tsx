"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Camera, Save, LocateFixed, Edit2, X, Phone, Mail } from "lucide-react";
import { updateAccountDetails, uploadAvatar } from "../../account/actions"; // Check your import path
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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
  
  // Local State for Geolocation feedback
  const [lat, setLat] = useState(user.latitude?.toString() || "");
  const [lng, setLng] = useState(user.longitude?.toString() || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // --- Handlers ---

  const handleProfileUpdate = async (formData: FormData) => {
    setIsLoading(true);
    const res = await updateAccountDetails(formData);
    setIsLoading(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      setIsEditing(false); // Switch back to read-only on success
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
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow location access.");
        console.error(error);
      }
    );
  };

  return (
    <div className="space-y-8">
      
      {/* 1. HEADER & AVATAR (Shared) */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Area */}
          <div 
            className={`relative group ${isEditing ? "cursor-pointer" : ""}`} 
            onClick={() => isEditing && fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 relative">
              <Image 
                src={user.avatar_url || "/placeholder.png"} 
                alt="Profile" 
                fill 
                className="object-cover"
              />
              {/* Loading State */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              {/* Edit Overlay (Only visible in Edit Mode) */}
              {isEditing && !isUploading && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>
            
            {/* Small Icon Badge */}
            {isEditing && (
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <Camera className="w-3 h-3" />
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
          
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge variant="secondary" className="capitalize">{user.role} Account</Badge>
            </div>
            <p className="text-sm font-mono text-gray-400 pt-1">{user.phone}</p>
          </div>
        </div>

        {/* Top Right Edit Button */}
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        )}
      </div>

      {/* 2. CONDITIONAL CONTENT */}
      {isEditing ? (
        
        /* --- EDIT MODE FORM --- */
        <form action={handleProfileUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input value={user.phone || ""} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                <p className="text-[10px] text-gray-400">Login ID cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input name="email" defaultValue={user.email || ""} placeholder="billing@example.com" />
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" /> Location Details
              </h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleGeolocation}
                className="text-xs h-8 gap-1.5"
              >
                <LocateFixed className="w-3.5 h-3.5" /> Use Current Location
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea 
                name="address_text" 
                defaultValue={user.address_text || ""} 
                placeholder="Shop No, Street, Landmark, City..." 
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  name="latitude" 
                  value={lat} 
                  onChange={(e) => setLat(e.target.value)} 
                  placeholder="0.0000" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  name="longitude" 
                  value={lng} 
                  onChange={(e) => setLng(e.target.value)} 
                  placeholder="0.0000" 
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
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
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact Details</h3>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                  <p className="text-xs text-gray-500">Primary Mobile</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.email || "Not provided"}</p>
                  <p className="text-xs text-gray-500">Billing Email</p>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Shipping Address</h3>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-line leading-relaxed">
                    {user.address_text || "No address on file."}
                  </p>
                  {(user.latitude || user.longitude) && (
                    <p className="text-xs text-blue-600 mt-2 font-mono bg-blue-50 px-2 py-1 rounded w-fit">
                      Lat: {user.latitude}, Lng: {user.longitude}
                    </p>
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