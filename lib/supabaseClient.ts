import { createClient } from "@supabase/supabase-js";

// Read the environment variables from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Simple check to make sure you've added your variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Check your .env.local file."
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);