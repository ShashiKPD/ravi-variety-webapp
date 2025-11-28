'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(searchParams.get("error")) 
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 1. Format Phone Number (Prepend +91)
    // Only prepend if user hasn't typed it already
    const cleanPhone = phone.trim();
    const formattedPhone = cleanPhone.startsWith('+91') 
      ? cleanPhone 
      : `+91${cleanPhone}`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password,
    })

    if (authError) {
      setError("Invalid Phone Number or Password")
      setLoading(false)
    } else {
      // 2. Fetch User Role for Redirection
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
      // Note: We don't set loading false here to prevent button flashing during redirect
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-blue-900">Ravi Variety B2B</CardTitle>
          <CardDescription>
            Enter your mobile number to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {/* Phone Input with +91 Prefix */}
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
                    // Only allow numbers
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) setPhone(val);
                  }}
                  required
                  className="border-none shadow-none focus-visible:ring-0 rounded-none h-10 tracking-widest text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
              </div>
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
        </CardContent>
      </Card>
    </div>
  )
}