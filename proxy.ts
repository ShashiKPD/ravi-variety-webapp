import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const url = request.nextUrl.clone();
  
  // 1. DEFINE PROTECTED ROUTES
  // These are the ONLY paths where we demand to know who the user is immediately.
  const sensitiveRoutes = ["/admin", "/account", "/checkout", "/cart"];
  const isSensitivePage = sensitiveRoutes.some(path => url.pathname.startsWith(path));
  const isLoginPage = url.pathname === "/login";

  // 2. LAZY AUTH CHECK
  // We only fetch the user if we are on a sensitive page or the login page.
  // FOR ALL OTHER PAGES (Home, Products, etc.), WE SKIP THIS.
  if (isSensitivePage || isLoginPage) {
    const { data: { user } } = await supabase.auth.getUser();

    if (isSensitivePage) {
      if (!user) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
      
      // Admin Guard
      if (url.pathname.startsWith("/admin")) {
        const role = user.user_metadata?.role;
        if (role !== "admin") {
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
    }

    if (isLoginPage && user) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};