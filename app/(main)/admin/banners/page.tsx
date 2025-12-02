import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddBannerForm from "../components/AddBannerForm"; // We will create this
import BackButton from "@/app/(main)/components/BackButton";
import Image from "next/image";
import DeleteBannerButton from "../components/DeleteBannerButton"; // And this

export default async function BannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase.from("banners").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <BackButton href="/admin" label="Back to Dashboard" />
      
      <Card>
        <CardHeader>
          <CardTitle>Homepage Banners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Upload Form */}
          <AddBannerForm />

          {/* List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
            {banners && banners.length > 0 ? (
              banners.map((banner) => (
                <div key={banner.id} className="relative group border rounded-lg overflow-hidden aspect-[2.5/1]">
                  <Image 
                    src={banner.image_url} 
                    alt="Banner" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteBannerButton id={banner.id} />
                  </div>
                  {banner.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                      {banner.title}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm col-span-2 text-center py-8">No banners uploaded.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}