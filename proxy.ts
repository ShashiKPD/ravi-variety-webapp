import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 1. Get User (Network Call #1 - Unavoidable for security)
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 2. Auth Protection Logic
  
  // A. Admin Routes Protection
  if (pathname.startsWith("/admin")) {
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // OPTIMIZATION: Check role from Metadata instead of DB Call #2
    // We assume 'role' is synced to user_metadata on creation/update.
    const userRole = user.user_metadata?.role;

    if (userRole !== "admin") {
      // Not an admin? Kick them to home.
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // B. Redirect Logged-In Users away from Login page
  if (pathname === "/login" && user) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // C. Update Session (Important for scrolling sessions)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};