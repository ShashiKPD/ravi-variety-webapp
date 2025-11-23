import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Get the data from the request
  const { email, password, full_name, role } = await request.json();

  // 2. Get our secret keys from the environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return new NextResponse("Supabase config missing", { status: 500 });
  }

  // 3. Create a new Supabase client with ADMIN privileges
  // This client can bypass RLS (Row Level Security)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 4. Create the new user in the 'auth.users' table
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // We auto-confirm them since we are the admin
    });

  if (authError) {
    console.error("Error creating user:", authError);
    return new NextResponse(authError.message, { status: 400 });
  }

  // 5. If user creation was successful, add their profile to our 'profiles' table
  if (authData.user) {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id, // This is the foreign key link
        full_name: full_name,
        role: role,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // This is tricky: the auth user was created but the profile failed.
      // We should ideally delete the auth user here, but for now, we'll just report the error.
      return new NextResponse(profileError.message, { status: 400 });
    }

    // 6. All good!
    return new NextResponse(
      JSON.stringify({ 
        message: "User created successfully",
        // We send back the data we just created
        user: { 
          full_name: full_name,
          role: role,
          email: email 
        } 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new NextResponse("An unknown error occurred", { status: 500 });
}