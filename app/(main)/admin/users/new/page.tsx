"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function CreateUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form State
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Restored Email State
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [role, setRole] = useState("retailer");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    // Format Phone
    const formattedPhone = `+91${phone}`;

    const response = await fetch("/admin/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formattedPhone,
        email, // Send Email
        password,
        full_name: fullName,
        address,
        latitude: lat,
        longitude: lng,
        role,
      }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {
      setMessage(`Success! User "${data.user.full_name}" created.`);
      setPhone("");
      setEmail(""); // Reset Email
      setPassword("");
      setFullName("");
      setAddress("");
      setLat("");
      setLng("");
      setRole("retailer");
    } else {
      setError(`Error: ${data.message || 'Something went wrong'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 pb-20">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
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
              <div className="flex items-center justify-center bg-gray-50 px-3 border-r border-gray-200 text-gray-500 text-sm font-medium">
                +91
              </div>
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

        {/* Contact (Email is here now) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address (For Invoices)</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="billing@example.com"
            required // Optional: remove 'required' if email isn't mandatory
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full billing address..." className="h-20" />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude (Optional)</Label>
            <Input id="lat" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="22.5726" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude (Optional)</Label>
            <Input id="lng" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="88.3639" />
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