"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Camera, User } from "lucide-react";
import BackButton from "@/app/(main)/components/BackButton";

export default function CreateUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const formattedPhone = `+91${phone}`;

    // Use FormData for file upload
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
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        body: formData, // Send as multipart/form-data
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! User "${fullName}" created.`);
        // Reset
        setPhone(""); setEmail(""); setPassword(""); setFullName("");
        setAddress(""); setLat(""); setLng(""); setRole("retailer");
        setAvatarFile(null); setPreviewUrl(null);
      } else {
        setError(`Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <BackButton href="/admin/users" label="Back to User List" />
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Picker */}
        <div className="flex items-center gap-6 pb-4">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 relative">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <User className="w-8 h-8" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <div>
            <Label className="font-medium">Profile Photo (Optional)</Label>
            <p className="text-xs text-gray-500 mt-1">Click the circle to upload.</p>
          </div>
        </div>

        {/* Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Business Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retailer">Retailer</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Login ID)</Label>
            <div className="flex rounded-md shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
              <div className="flex items-center justify-center bg-gray-50 px-3 border-r border-gray-200 text-gray-500 text-sm font-medium">+91</div>
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
                className="border-none shadow-none focus-visible:ring-0 rounded-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address (Optional)</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full billing address..." className="h-20" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create User"}
        </Button>
      </form>
      
      {message && <div className="mt-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">{message}</div>}
      {error && <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">{error}</div>}
    </div>
  );
}