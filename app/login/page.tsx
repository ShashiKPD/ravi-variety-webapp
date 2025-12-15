"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/lib/context/CartContext"; // ✅ Import Cart Context
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner"; // Assuming you use Sonner for toasts

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const { clearCart } = useCart(); // ✅ Access clear action

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get("error"));

  // ✅ 1. DETECT LOGOUT SIGNAL
  useEffect(() => {
    if (searchParams.get("logout") === "success") {
      clearCart(); // Wipe the context
      toast.info("Logged out successfully");
      
      // Clean the URL so a refresh doesn't trigger it again (optional)
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("logout");
      router.replace(`/login?${newParams.toString()}`);
    }
  }, [searchParams, clearCart, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanPhone = phone.trim();
    // Robust Format: If user typed 12 digits (9198...), handle it. If 10, add +91.
    let formattedPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      formattedPhone = `+91${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      formattedPhone = `+${cleanPhone}`;
    } else if (!cleanPhone.startsWith("+")) {
       // Fallback for weird inputs, assume +91
       formattedPhone = `+91${cleanPhone}`;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password,
    });

    if (authError) {
      setError("Invalid Phone Number or Password");
      setLoading(false);
    } else {
      // 2. Refresh Context & Router to ensure Middleware runs
      router.refresh(); 
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const nextUrl = searchParams.get("next");
        const safeNextUrl = nextUrl && nextUrl.startsWith("/") ? nextUrl : null;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (safeNextUrl) {
          router.push(safeNextUrl);
        } else if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-lg border-0 sm:border">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold text-blue-900">Ravi Variety B2B</CardTitle>
        <CardDescription>Enter your mobile number to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex rounded-md shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="flex items-center justify-center bg-gray-100 px-3 border-r border-gray-200 text-gray-500 text-sm font-medium">
                +91
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  // Allow up to 12 digits (to support 91 prefix typing)
                  if (val.length <= 12) setPhone(val);
                }}
                required
                className="border-none shadow-none focus-visible:ring-0 rounded-none h-10 tracking-widest text-lg placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-sm text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base bg-blue-700 hover:bg-blue-800" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button variant="ghost" asChild className="mt-4 w-full text-gray-600 hover:text-blue-600 hover:bg-blue-50">
            <Link href="/">
              Skip login & browse store <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gray-50 px-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-blue-600" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}