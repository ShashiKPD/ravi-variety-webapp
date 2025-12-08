"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Camera, User, Key, Plus, MapPin } from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";
import { toast } from "sonner";

export default function CreateUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [role, setRole] = useState("retailer");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large (Max 5MB)");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formattedPhone = `+91${phone}`;

    const formData = new FormData();
    formData.append("phone", formattedPhone);
    if (email) formData.append("email", email);
    formData.append("password", password);
    formData.append("full_name", fullName);
    formData.append("address", address);
    formData.append("latitude", lat);
    formData.append("longitude", lng);
    formData.append("role", role);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const response = await fetch("/admin/api/create-user", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`User "${fullName}" created successfully`);
        router.push("/admin/users");
        router.refresh();
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (err) {
      toast.error("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-5 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <BackButton href="/admin/users" label="Back to User List" />
        <div className="mt-1 sm:mt-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Create New User</h1>
          <p className="text-xs sm:text-sm text-gray-500">Add a new customer, wholesaler, or staff member.</p>
        </div>
      </div>
      
      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
            User Details
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            
            {/* --- AVATAR --- */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-100">
              <div 
                className="relative group cursor-pointer shrink-0" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50 relative group-hover:border-blue-100 transition-all">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center rounded-full">
                    {/* Visual hint only */}
                  </div>
                </div>
                
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full border-2 border-white shadow-sm z-10 active:scale-90 transition-transform">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
              
              <div className="text-center sm:text-left space-y-1 sm:mt-2">
                <h3 className="text-sm font-semibold text-gray-900">Profile Photo</h3>
                <p className="text-xs text-gray-500 max-w-[200px] mx-auto sm:mx-0">
                  Upload a clear image for the user profile. Optional.
                </p>
              </div>
            </div>

            {/* --- IDENTITY --- */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-1.5">Identity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    placeholder="e.g. John Doe" 
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role" className="bg-white"><SelectValue /></SelectTrigger>
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
                  <Label htmlFor="phone">Phone Number (Login ID)</Label>
                  <div className="flex rounded-md shadow-sm border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                    <div className="flex items-center justify-center bg-gray-50 px-3 border-r border-input text-gray-500 text-sm font-medium">+91</div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setPhone(val);
                      }}
                      required
                      className="border-none shadow-none focus-visible:ring-0 rounded-none bg-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="password">Initial Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      minLength={6} 
                      placeholder="Min 6 chars"
                      className="bg-white pl-9"
                    />
                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="billing@example.com (Optional)" 
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* --- LOCATION --- */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-1.5">Location</h4>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Street, City, State, ZIP..." 
                    className="min-h-[80px] bg-white resize-y text-sm" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="lat" className="text-xs text-gray-500">Latitude</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <Input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} className="bg-white pl-8 h-9 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lng" className="text-xs text-gray-500">Longitude</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <Input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} className="bg-white pl-8 h-9 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit */}
            <div className="pt-4 sm:pt-6 border-t flex justify-end">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  <><Plus className="mr-2 h-4 w-4" /> Create User</>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}