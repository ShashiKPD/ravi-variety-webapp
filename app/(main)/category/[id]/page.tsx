import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CategoryContent from "../../components/CategoryContent";
import { ProductSummary, ProductPrice } from "@/lib/types";

// Helper to fetch prices (Server-side logic)
async function fetchPricesForProducts(products: any[], supabase: any, userRole: string) {
  if (userRole === "anon" || products.length === 0) {
    return products.map(p => ({ ...p, price_data: null }));
  }
  const promises = products.map(async (p) => {
    const { data } = await supabase.rpc("get_price_for_variant", {
      p_variant_id: p.variant_id,
      p_quantity: 1,
      p_user_role: userRole,
    }).single();
    return { ...p, price_data: data as ProductPrice | null };
  });
  return Promise.all(promises);
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CategoryPage({ params }: PageProps) {
  // 1. Await params (Next.js 15 requirement)
  const { id } = await params;
  const supabase = await createClient();
  const categoryId = Number(id);

  // 2. Get User Context (Role & Wishlist)
  const { data: { user } } = await supabase.auth.getUser();
  let wishlistVariantIds = new Set<number>();
  let userRole = "anon";
  let showInteractiveButtons = false;

  if (user) {
    const [profileRes, wishlistRes] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("wishlist_items").select("variant_id").eq("user_id", user.id),
    ]);
    userRole = profileRes.data?.role || "anon";
    if (wishlistRes.data) {
      wishlistVariantIds = new Set(wishlistRes.data.map((item) => item.variant_id));
    }
    showInteractiveButtons = ["retailer", "wholesaler", "admin"].includes(userRole);
  }

  // 3. Fetch Category Info (for the Title)
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (catError || !category) return notFound();

  // 4. Fetch Products in this Category
  const { data: productsRaw, error: prodError } = await supabase
    .rpc("get_products_by_category", { p_category_id: categoryId });

  if (prodError) {
    console.error("Category product fetch error:", prodError);
  }

  const products = await fetchPricesForProducts(productsRaw || [], supabase, userRole);

  // 5. Fetch Brands (for the sidebar filters)
  // We fetch all brands for now to populate the filter list
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name")
    .order('name');

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
         
         {/* We pass everything to the Client Component to handle state/filtering */}
         <CategoryContent 
            categoryName={category.name}
            products={products as ProductSummary[]}
            brands={brands || []}
            showInteractiveButtons={showInteractiveButtons}
            wishlistVariantIds={wishlistVariantIds}
         />
      </div>
    </div>
  );
}