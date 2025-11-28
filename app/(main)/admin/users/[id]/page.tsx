import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, MapPin, Mail, Phone, Calendar, User, Ban, CheckCircle } from "lucide-react";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) notFound();

  const isActive = profile.is_active !== false;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              {isActive ? (
                <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 gap-1">
                  <CheckCircle className="w-3 h-3" /> Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <Ban className="w-3 h-3" /> Disabled
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 font-mono text-xs mt-1">{profile.id}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/users/${profile.id}/edit`}>
            <Edit className="w-4 h-4 mr-2" /> Edit User
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Identity & Role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Account Role</p>
              <Badge className="mt-1 capitalize px-3 py-1 text-sm bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200">
                {profile.role}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {profile.created_at 
                    ? new Date(profile.created_at).toLocaleDateString() 
                    : "Unknown"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-600" /> Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Email Address</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium">{profile.email || "No email provided"}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone Number</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{profile.phone || "No phone provided"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Location / Address */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Billing / Shipping Address</p>
              <p className="text-sm font-medium whitespace-pre-wrap bg-gray-50 p-3 rounded-md border text-gray-700">
                {profile.address_text || "No address on file."}
              </p>
            </div>
            
            {(profile.latitude || profile.longitude) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Latitude</p>
                  <p className="text-sm font-mono">{profile.latitude}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Longitude</p>
                  <p className="text-sm font-mono">{profile.longitude}</p>
                </div>
                <div className="col-span-2">
                  <a 
                    href={`http://maps.google.com/?q=${profile.latitude},${profile.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Open in Google Maps <ArrowLeft className="w-3 h-3 rotate-135" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}