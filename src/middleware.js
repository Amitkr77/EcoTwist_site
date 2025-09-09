import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Admin token
  const adminToken = req.cookies.get("token")?.value;

  // Manager tokens
  const salesToken = req.cookies.get("manager-sales-token")?.value;
  const financeToken = req.cookies.get("manager-finance-token")?.value;
  const marketingToken = req.cookies.get("manager-marketing-token")?.value;

  // User token
  const userToken = req.cookies.get("user-token")?.value;

  // Skip check for auth/register pages
  if (
    pathname.startsWith("/admin/auth") ||
    pathname.startsWith("/manager/login") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const decoded = verifyToken(adminToken, process.env.ADMIN_JWT_SECRET || "admin_jwt_secret_key");
    if (!decoded || decoded.role !== "admin") {
      const loginUrl = new URL("/admin/auth", req.url);
      loginUrl.searchParams.set("error", "login-first");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect sales manager routes
  if (pathname.startsWith("/manager/sales")) {
    const decoded = verifyToken(salesToken, process.env.MANAGER_JWT_SECRET);
    if (!decoded || decoded.role !== "manager:sales") {
      const loginUrl = new URL("/manager/login", req.url);
      loginUrl.searchParams.set("error", "login-first");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect finance manager routes
  if (pathname.startsWith("/manager/finance")) {
    const decoded = verifyToken(financeToken, process.env.MANAGER_JWT_SECRET);
    if (!decoded || decoded.role !== "manager:finance") {
      const loginUrl = new URL("/manager/login", req.url);
      loginUrl.searchParams.set("error", "login-first");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect marketing manager routes
  if (pathname.startsWith("/manager/marketing")) {
    const decoded = verifyToken(marketingToken, process.env.MANAGER_JWT_SECRET || "manager-secret-key");
    if (!decoded || decoded.role !== "manager:marketing") {
      const loginUrl = new URL("/manager/login", req.url);
      loginUrl.searchParams.set("error", "login-first");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect user profile routes
  if (pathname.startsWith("/profile")) {
    const decoded = verifyToken(userToken, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "user") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "login-first");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/admin/:path((?!auth|register).*)",
    "/manager/(sales|finance|marketing)/:path((?!login).*)",
    "/profile/:path*",
  ],
};
