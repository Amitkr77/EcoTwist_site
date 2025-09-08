import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token");
  const { pathname } = req.nextUrl;

  // 👇 Skip check for login/register pages
  if (pathname.startsWith("/admin/auth") || pathname.startsWith("/admin/register")) {
    return NextResponse.next();
  }

  // 🔒 Protect all other /admin routes
  if (!token && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/admin/auth", req.url);
    loginUrl.searchParams.set("error", "login-first");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
