import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Parse FormData instead of JSON
  const formData = await request.formData();

  const phone = formData.get("phone") as string;
  const emailRaw = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const address = formData.get("address") as string;
  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const avatarFile = formData.get("avatar") as File | null;

  const email = emailRaw && emailRaw.trim() !== "" ? emailRaw : undefined;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey)
    return new NextResponse("Config error", { status: 500 });

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. Create Auth User
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      phone: phone,
      email: email,
      password: password,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

  if (authError) {
    return new NextResponse(authError.message, { status: 400 });
  }

  if (authData.user) {
    let avatarUrl = null;

    // 3. Upload Avatar (if provided)
    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${authData.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          contentType: avatarFile.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      } else {
        console.error("Avatar upload failed:", uploadError);
      }
    }

    // 4. Upsert Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        role: role,
        email: email,
        phone: phone,
        address_text: address || null,
        latitude: latStr ? parseFloat(latStr) : null,
        longitude: lngStr ? parseFloat(lngStr) : null,
        avatar_url: avatarUrl, // Save the URL
      });

    if (profileError) {
      return new NextResponse(profileError.message, { status: 400 });
    }

    return new NextResponse(
      JSON.stringify({ message: "User created successfully" }),
      { status: 200 },
    );
  }

  return new NextResponse("Unknown error", { status: 500 });
}
