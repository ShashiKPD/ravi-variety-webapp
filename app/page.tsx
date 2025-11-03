// We can now import our client directly
import { supabase } from "@/lib/supabaseClient";

// Mark this component as a "Server Component"
// 'use client' is not needed just for data fetching
export default async function HomePage() {
  
  // This is how we fetch data with Supabase
  // It's like writing SQL: "SELECT name FROM categories"
  const { data: categories, error } = await supabase
    .from("categories")
    .select("name");

  if (error) {
    console.error("Error fetching categories:", error);
    // You could return an error message here
  }
  

  return (
    <main>
      <h1>Ravi Variety App (Homepage)</h1>
      
      <h2>Categories from Supabase:</h2>
      
      {/* Check if categories exist and display them */}
      {categories && categories.length > 0 ? (
        <ul>
          {categories.map((category) => (
            <li key={category.name}>{category.name}</li>
          ))}
        </ul>
      ) : (
        <p>No categories found. (Check your Supabase 'categories' table)</p>
      )}
    </main>
  );
}