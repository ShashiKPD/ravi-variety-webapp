import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Redirect to login with a message
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Your account has been disabled.`);
}