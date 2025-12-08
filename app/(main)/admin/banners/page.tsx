import { createClient } from "@/utils/supabase/server";
import BackButton from "@/app/(main)/components/BackButton";
import BannerManager from "../components/banners/BannerManager";

export default async function BannersPage() {
  const supabase = await createClient();
  
  // Fetch banners ordered by 'sort_order'
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true }); // Important: Ascending order

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      <BackButton href="/admin" label="Back to Dashboard" />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Banners</h1>
          <p className="text-sm text-gray-500">Add, delete, and reorder banners.</p>
        </div>
      </div>

      <BannerManager initialBanners={banners || []} />
    </div>
  );
}