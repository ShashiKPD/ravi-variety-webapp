import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductGrid from "../../components/ProductGrid";
import SuperCategorySidebar from "../../components/SuperCategorySidebar"; 
import { ProductSummary, ProductPrice } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";

async function fetchPricesForProducts(products: any[], supabase: any, userRole: string) {
  if (!userRole || userRole === "anon" || products.length === 0) return products.map(p => ({ ...p, price_data: null }));
  const promises = products.map(async (p) => {
    const { data } = await supabase.rpc("get_price_for_variant", { p_variant_id: p.variant_id, p_quantity: 1, p_user_role: userRole }).single();
    return { 
      variant_id: p.variant_id, variant_name: p.variant_name, product_id: p.product_id, 
      product_name: p.product_name, product_slug: p.product_slug, thumbnail_url: p.thumbnail_url, 
      stock_quantity: p.stock_quantity, price_data: data as ProductPrice | null 
    } as ProductSummary;
  });
  return Promise.all(promises);
}

export default async function CategoryPage({ params, searchParams }: any) {
  const supabase = await createClient();
  const { slug } = await params;
  const urlParams = await searchParams;

  const { data: supercat } = await supabase
    .from("supercategories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  let sidebarContextId = 0;
  let pageTitle = "";
  let activeCategoryId: number | null = null;
  let categoryFilterIds: number[] | null = null;
  
  // To build correct links in the sidebar, we need the supercategory slug
  let supercategorySlug = "";

  if (supercat) {
     pageTitle = supercat.name;
     sidebarContextId = supercat.id;
     supercategorySlug = supercat.slug;
     activeCategoryId = null; 
  } else {
     const { data: subcat } = await supabase
       .from("categories")
       .select("id, name, slug, supercategory_id, supercategories(slug)")
       .eq("slug", slug)
       .single();

     if (!subcat) return notFound();

     pageTitle = subcat.name;
     
     if (subcat.supercategory_id) {
       sidebarContextId = subcat.supercategory_id;
       // Get parent slug from relation (handled as array or object depending on join)
       const parent = Array.isArray(subcat.supercategories) ? subcat.supercategories[0] : subcat.supercategories;
       supercategorySlug = parent?.slug || "";
       
       activeCategoryId = subcat.id; 
       categoryFilterIds = [subcat.id]; 
     } else {
       sidebarContextId = 0; 
       activeCategoryId = subcat.id;
       categoryFilterIds = [subcat.id];
     }
  }

  const { data: { user } } = await supabase.auth.getUser();
  let userRole = "anon";
  let wishlistVariantIds = new Set<number>();
  if (user) {
     const [pRes, wRes] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        supabase.from("wishlist_items").select("product_id").eq("user_id", user.id)
     ]);
     userRole = pRes.data?.role || "anon";
     if (wRes.data) wishlistVariantIds = new Set(wRes.data.map((i: any) => i.product_id));
  }

  const page = Number(urlParams.page) || 1;
  const limit = 20;

  const finalCategoryIds = urlParams.categories ? urlParams.categories.split(",").map(Number) : categoryFilterIds;

  const [searchResults, taxonomyRes] = await Promise.all([
    supabase.rpc("search_products", {
      p_search_text: null,
      p_supercategory_id: sidebarContextId,
      p_category_ids: finalCategoryIds,
      p_brand_ids: urlParams.brands?.split(",").map(Number),
      p_sizes: urlParams.sizes?.split(","),
      p_min_price: urlParams.min_price ? Number(urlParams.min_price) : null,
      p_max_price: urlParams.max_price ? Number(urlParams.max_price) : null,
      p_sort_by: urlParams.sort || "newest",
      p_page: page,
      p_limit: limit
    }),
    supabase.rpc("get_supercategory_taxonomy", { p_supercategory_id: sidebarContextId }),
  ]);

  const productsRaw = searchResults.data || [];
  const totalCount = productsRaw[0]?.total_count || 0;
  const products = await fetchPricesForProducts(productsRaw, supabase, userRole);
  const showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);

  return (
    <div className="bg-gray-50 min-h-screen">
      
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">{pageTitle}</h1>
            <p className="text-xs text-gray-500 mt-1">{Number(totalCount)} items</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 border rounded-full text-xs font-medium bg-gray-50">
                <SlidersHorizontal className="w-3 h-3" /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-start">
          
          <aside className="w-[20%] shrink-0 border-r border-gray-200 min-h-[calc(100vh-110px)] bg-white sticky top-[110px] self-start overflow-y-auto max-h-[calc(100vh-110px)] scrollbar-hide">
             <SuperCategorySidebar 
               taxonomy={taxonomyRes.data || []} 
               activeCategoryId={activeCategoryId ? String(activeCategoryId) : null} 
               supercategorySlug={supercategorySlug} 
             />
          </aside>

          <div className="flex-1 min-w-0 p-2 md:p-6 bg-gray-50">
            <ProductGrid 
              products={products}
              totalCount={Number(totalCount)}
              currentPage={page}
              limit={limit}
              showInteractiveButtons={showInteractiveButtons}
              wishlistVariantIds={wishlistVariantIds}
              currentParams={urlParams}
              clearFiltersHref={`/category/${slug}`} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}