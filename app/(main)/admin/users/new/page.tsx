"use client"; // This must be a Client Component because it uses state and handles form submission.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateUserPage() {
  // We use state to control the form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("retailer"); // Default role
  
  // State for showing messages to the admin
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the browser from refreshing the page
    setIsLoading(true);
    setMessage("");
    setError("");

    // Send the form data to our API route
    const response = await fetch("/admin/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
        full_name: fullName,
        role: role,
      }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {
      setIsLoading(false);

      // 1. Set the new, dynamic success message
      setMessage(`Success! User "${data.user.full_name}" created.`);

      // 2. Clear the form fields for the next entry
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("retailer");
    } else {
      setIsLoading(false);
      setError(`Error: ${data.message || 'Something went wrong'}`);
    }
  };

  return (
    // We use Tailwind classes for layout (shadcn is built on Tailwind)
    <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6} // Supabase requires 6+ characters
            placeholder="Min 6 characters"
          />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retailer">Retailer</SelectItem>
              <SelectItem value="wholesaler">Wholesaler</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </form>
      
      {/* Show success or error messages to the admin */}
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}