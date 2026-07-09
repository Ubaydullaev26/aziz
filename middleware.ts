import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/map", "/search", "/places", "/events", "/guides", "/account"];
const ADMIN_PREFIX = "/admin";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isProtectedRoute =
    isAdminRoute || PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isProtectedRoute) return NextResponse.next();

  if (!isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute && role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/map", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
