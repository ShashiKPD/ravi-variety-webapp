import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Redirect to login with a specific 'logout' signal
  const requestUrl = new URL(request.url);
  // We use "logout=success" so the Login page knows to clear the cart
  return NextResponse.redirect(`${requestUrl.origin}/login?logout=success`);
}