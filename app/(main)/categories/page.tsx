import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Tag, Layers } from "lucide-react";

export const revalidate = 3600;

type CategoryWithParent = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  supercategories: { slug: string } | { slug: string }[] | null;
};

export default async function AllCategoriesPage() {
  const supabase = await createClient();

  const [superCatsRes, catsRes, brandsRes] = await Promise.all([
    supabase.from("supercategories").select("id, name, slug, image_url").order("name"),
    
    supabase.from("categories").select("id, name, slug, image_url, supercategories(slug)").order("name"),
    
    // UPDATED: Added 'slug' to selection
    supabase.from("brands").select("id, name, slug, image_url").order("name")
  ]);

  const supercategories = superCatsRes.data || [];
  const categories = (catsRes.data || []) as unknown as CategoryWithParent[];
  const brands = brandsRes.data || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header Banner */}
      {/* <div className="bg-white border-b border-gray-200 px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Catalog</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Browse all departments, categories, and top brands in one place.
          </p>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        
        {/* 1. Shop By Department */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
               <Layers className="w-5 h-5 text-purple-600" /> Departments
            </h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {supercategories.map((supercat) => (
              <Link key={supercat.id} href={`/category/${supercat.slug}`} className="group block h-full">
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-300 h-full flex flex-col">
                  <div className="p-3 flex flex-col items-center flex-1 gap-2">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-50 overflow-hidden border border-purple-100 group-hover:scale-105 transition-transform duration-300">
                      {supercat.image_url ? (
                        <Image 
                          src={supercat.image_url} 
                          alt={supercat.name} 
                          fill 
                          className="object-cover"
                          sizes="100px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-300 font-bold text-lg">
                          {supercat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <h3 className="text-xs font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1 leading-tight">
                        {supercat.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 2. Shop By Category */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             <LayoutGrid className="w-5 h-5 text-blue-600" /> All Categories
          </h2>
          
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2">
            {categories.map((cat) => {
               const parentData = cat.supercategories; 
               const parentSlug = Array.isArray(parentData) ? parentData[0]?.slug : parentData?.slug;
               const href = parentSlug ? `/category/${parentSlug}?category=${cat.slug}` : `/category/${cat.slug}`;

               return (
                 <Link key={cat.id} href={href} className="group block h-full">
                   <div className="bg-white border border-gray-100 rounded-lg p-2 hover:shadow-sm hover:border-blue-200 transition-all duration-200 h-full flex items-center gap-2.5">
                     <div className="relative w-8 h-8 rounded-md bg-gray-50 overflow-hidden shrink-0 border border-gray-100 group-hover:border-blue-100">
                       {cat.image_url ? (
                         <Image 
                           src={cat.image_url} 
                           alt={cat.name} 
                           fill 
                           className="object-cover group-hover:scale-110 transition-transform"
                           sizes="32px"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-blue-200 font-bold text-xs">
                           {cat.name.charAt(0)}
                         </div>
                       )}
                     </div>
                     <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 line-clamp-2 leading-tight">
                       {cat.name}
                     </span>
                   </div>
                 </Link>
               );
            })}
          </div>
        </section>

        {/* 3. Shop By Brand */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             <Tag className="w-5 h-5 text-orange-600" /> Popular Brands
          </h2>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {brands.map((brand) => (
              // UPDATED: Using brand.slug here
              <Link key={brand.id} href={`/search?brands=${brand.slug}`} className="group block h-full">
                <div className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-sm hover:border-orange-100 transition-all duration-200 h-full flex flex-col items-center justify-center gap-2 text-center">
                  <div className="relative w-full h-8">
                    {brand.image_url ? (
                      <Image 
                        src={brand.image_url} 
                        alt={brand.name} 
                        fill 
                        className="object-contain transition-all duration-300 group-hover:scale-105"
                        sizes="100px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] italic">
                        {brand.name}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}