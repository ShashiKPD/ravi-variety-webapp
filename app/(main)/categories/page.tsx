import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Tag, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function AllCategoriesPage() {
  const supabase = await createClient();

  // Fetch Supercategories, Categories, and Brands
  const [superCatsRes, catsRes, brandsRes] = await Promise.all([
    supabase.from("supercategories").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("brands").select("*").order("name")
  ]);

  const supercategories = superCatsRes.data || [];
  const categories = catsRes.data || [];
  const brands = brandsRes.data || [];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 bg-gray-50 min-h-screen space-y-10">
      
      {/* 1. Shop By Department (Supercategories) */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
           <Layers className="w-5 h-5 text-purple-600" /> Shop by Department
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {supercategories.map((supercat) => (
            <Link key={supercat.id} href={`/category/${supercat.slug}`} className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden py-2"> {/* Added py-2 */}
                <CardContent className="p-2 flex flex-col items-center gap-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-purple-50 overflow-hidden border border-purple-100">
                    {supercat.image_url ? (
                      <Image 
                        src={supercat.image_url} 
                        alt={supercat.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="100px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-300 font-bold text-xl">
                        {supercat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center text-gray-700 leading-tight line-clamp-2">
                    {supercat.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Shop By Category (Subcategories) */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
           <LayoutGrid className="w-5 h-5 text-blue-600" /> Explore Categories
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden py-2"> {/* Added py-2 */}
                <CardContent className="p-2 flex flex-col items-center gap-2">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-blue-50 overflow-hidden border border-blue-100">
                    {cat.image_url ? (
                      <Image 
                        src={cat.image_url} 
                        alt={cat.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="100px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-300 font-bold text-lg">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center text-gray-700 leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Shop By Brand */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
           <Tag className="w-5 h-5 text-orange-600" /> Shop by Brand
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/search?brands=${brand.id}`} className="group">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow py-2"> {/* Added py-2 */}
                <CardContent className="p-2 flex flex-col items-center gap-2">
                  <div className="relative w-full aspect-[3/2] bg-white rounded-md overflow-hidden border border-gray-100 p-2">
                    {brand.image_url ? (
                      <Image 
                        src={brand.image_url} 
                        alt={brand.name} 
                        fill 
                        className="object-contain"
                        sizes="150px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Logo</div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center text-gray-600 truncate w-full group-hover:text-blue-600">
                    {brand.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}