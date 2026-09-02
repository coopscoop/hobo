// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ email: payload.email, role: payload.role });
}
