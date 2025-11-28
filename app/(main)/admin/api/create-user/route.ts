import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Receive Email AND Phone
  const { phone, email, password, full_name, role, address, latitude, longitude } = await request.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) return new NextResponse("Config error", { status: 500 });

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. Create User with BOTH attributes
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      phone: phone,
      email: email, // Added back
      password: password,
      phone_confirm: true, // Auto-confirm phone
      email_confirm: true, // Auto-confirm email
      user_metadata: { full_name, role }
    });

  if (authError) {
    return new NextResponse(authError.message, { status: 400 });
  }

  // 3. Upsert Profile
  // The Trigger creates the row, but we run this to ensure address/lat/long/phone are set
  if (authData.user) {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        full_name: full_name,
        role: role,
        email: email, // Store in profiles
        phone: phone, // Store in profiles
        address_text: address || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });

    if (profileError) {
      return new NextResponse(profileError.message, { status: 400 });
    }

    return new NextResponse(
      JSON.stringify({ 
        message: "User created successfully",
        user: { full_name, role, phone } 
      }),
      { status: 200 }
    );
  }

  return new NextResponse("Unknown error", { status: 500 });
}