import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Edit, MapPin, Mail, Phone, 
  Calendar, User, Ban, CheckCircle, ExternalLink, Shield 
} from "lucide-react";

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

  // Helper for Role Styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'wholesaler':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Wholesaler</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal">Retailer</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4">
        {/* Nav & Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="-ml-3 pl-3 gap-2 text-gray-500 hover:text-gray-900 active:scale-95 transition-all">
            <Link href="/admin/users"><ArrowLeft className="w-4 h-4" /> Back to Users</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all shadow-sm">
            <Link href={`/admin/users/${profile.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Edit User
            </Link>
          </Button>
        </div>

        {/* User Profile Summary Card */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-300">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              {isActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  <Ban className="w-3 h-3" /> Disabled
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <span className="font-mono text-xs text-gray-400 select-all">ID: {profile.id}</span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Identity & Contact */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Details</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Account Role</p>
                {getRoleBadge(profile.role)}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Email Address</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {profile.email ? (
                      <a href={`mailto:${profile.email}`} className="hover:text-blue-600 hover:underline transition-colors">{profile.email}</a>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Phone Number</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {profile.phone ? (
                      <a href={`tel:${profile.phone}`} className="hover:text-blue-600 hover:underline transition-colors">{profile.phone}</a>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2. Location Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address Text
                </p>
                <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 leading-relaxed min-h-[80px]">
                  {profile.address_text || <span className="text-gray-400 italic">No address text on file.</span>}
                </div>
              </div>

              {(profile.latitude || profile.longitude) && (
                <>
                  <div className="h-px bg-gray-100 w-full" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Latitude</p>
                        <p className="text-sm font-mono bg-gray-50 px-2 py-1.5 rounded border border-gray-200 text-gray-700 inline-block w-full truncate">
                          {profile.latitude}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Longitude</p>
                        <p className="text-sm font-mono bg-gray-50 px-2 py-1.5 rounded border border-gray-200 text-gray-700 inline-block w-full truncate">
                          {profile.longitude}
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild className="w-full gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100">
                      <a 
                        href={`http://maps.google.com/?q=${profile.latitude},${profile.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <MapPin className="w-4 h-4" /> Open in Google Maps <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}