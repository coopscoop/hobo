import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/jwt";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isMutatingApiCall = pathname.startsWith("/api/") && MUTATING_METHODS.has(req.method);

  if (!isAdminPage && !isMutatingApiCall) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_session")?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) {
    if (isAdminPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
