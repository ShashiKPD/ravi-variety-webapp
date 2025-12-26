import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Tag, ChevronRight } from "lucide-react";

export const revalidate = 3600;

// Type Definitions
type SuperCategory = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  supercategories: { id: number; slug: string } | { id: number; slug: string }[] | null;
};

type Brand = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

// Helper: Group Categories by Department
function groupCategoriesByDepartment(
  superCats: SuperCategory[],
  cats: Category[]
) {
  return superCats.map((dept) => {
    const departmentCats = cats.filter((cat) => {
      const relation = cat.supercategories;
      if (Array.isArray(relation)) {
        return relation.some((r) => r.slug === dept.slug);
      }
      return relation?.slug === dept.slug;
    });

    return { ...dept, items: departmentCats };
  }).filter(group => group.items.length > 0);
}

export default async function AllCategoriesPage() {
  const supabase = await createClient();

  const [superCatsRes, catsRes, brandsRes] = await Promise.all([
    supabase.from("supercategories").select("id, name, slug, image_url").order("name"),
    supabase.from("categories").select("id, name, slug, image_url, supercategories(id, slug)").order("name"),
    supabase.from("brands").select("id, name, slug, image_url").order("name"),
  ]);

  const supercategories = (superCatsRes.data || []) as SuperCategory[];
  const categories = (catsRes.data || []) as unknown as Category[];
  const brands = (brandsRes.data || []) as Brand[];

  const groupedData = groupCategoriesByDepartment(supercategories, categories);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      
      {/* Container */}
      <div className="max-w-[1400px] mx-auto flex items-start gap-6 px-3 py-4 md:px-4 md:py-6">
        
        {/* SIDEBAR (Desktop): Added active states */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-hide">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Departments</h2>
          <nav className="space-y-0.5">
            {groupedData.map((group) => (
              <a 
                key={group.id} 
                href={`#dept-${group.slug}`}
                className="flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm active:bg-gray-100 active:scale-[0.98] transition-all"
              >
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {group.image_url && (
                    <Image src={group.image_url} alt="" width={20} height={20} className="object-cover w-full h-full" />
                  )}
                </div>
                <span className="truncate">{group.name}</span>
              </a>
            ))}
            <div className="h-px bg-gray-200 my-2 mx-2" />
            <a 
              href="#popular-brands"
              className="flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium text-gray-600 hover:bg-white hover:text-orange-600 hover:shadow-sm active:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <Tag className="w-4 h-4 text-orange-500" />
              Popular Brands
            </a>
          </nav>
        </aside>

        {/* MAIN CONTENT: User Spacing (space-y-4) applied here */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {groupedData.map((group) => (
            <section key={group.id} id={`dept-${group.slug}`} className="scroll-mt-24">
              
              {/* Header: User Spacing (mb-2, pb-1) applied here */}
              <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-1">
                <div className="flex items-center gap-2">
                   {/* Tiny Department Icon */}
                   <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {group.image_url && <Image src={group.image_url} alt="" width={32} height={32} className="object-cover" />}
                   </div>
                   <h2 className="text-sm md:text-lg font-bold text-gray-800">{group.name}</h2>
                </div>
                
                {/* Active State: Scale + Bg Change */}
                <Link 
                  href={`/category/${group.slug}`}
                  className="text-[10px] md:text-xs font-bold text-blue-600 hover:bg-blue-50 active:bg-blue-100 active:scale-95 px-2 py-1 rounded-full transition-all flex items-center gap-0.5"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Grid: High Density + Active States */}
              <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {group.items.map((cat) => (
                  <Link 
                    key={cat.id} 
                    href={`/category/${group.slug}?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-black/5 active:scale-95 active:bg-gray-50 transition-all duration-100"
                  >
                    {/* Compact Image Container */}
                    <div className="relative w-full aspect-square rounded-xl bg-white border border-gray-100 overflow-hidden group-hover:border-blue-200 group-active:border-blue-300 transition-colors">
                      {cat.image_url ? (
                        <Image 
                          src={cat.image_url} 
                          alt={cat.name} 
                          fill 
                          className="object-cover p-0.5 rounded-xl group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 25vw, 100px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 font-bold text-sm">
                          {cat.name[0]}
                        </div>
                      )}
                    </div>
                    {/* Compact Label */}
                    <span className="text-[10px] md:text-xs font-medium text-gray-600 text-center leading-tight line-clamp-2 group-hover:text-blue-700 h-[2.5em]">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* Brands Section: Compact Grid + Active States */}
          {brands.length > 0 && (
            <section id="popular-brands" className="scroll-mt-24 pt-4 border-t border-gray-100">
              <h2 className="text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-500" /> Popular Brands
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-2">
                {brands.map((brand) => (
                  <Link 
                    key={brand.id} 
                    href={`/search?brands=${brand.slug}`}
                    className="bg-white border border-gray-200 rounded-lg p-2 hover:border-orange-200 hover:shadow-sm active:scale-95 active:bg-orange-50 active:border-orange-300 transition-all aspect-[3/2] flex items-center justify-center relative group"
                  >
                    {brand.image_url ? (
                      <Image 
                        src={brand.image_url} 
                        alt={brand.name} 
                        fill 
                        className="object-contain p-1.5 group-hover:scale-105 transition-transform"
                        sizes="100px"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-gray-400 text-center leading-none">{brand.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}