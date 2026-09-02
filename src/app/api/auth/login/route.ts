import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getAdminByEmail } from "@/lib/db/queries/admin";
import { signAdminToken } from "@/lib/auth/jwt";

// oddly specific hash for any emails that don't exist so the response time isn't faster on an invalid email vs a valid one
// idk ai wanted it to be in here
const DUMMY_HASH = "$2b$12$IwN5wC.Jgi8Hdck9Z3UP/OzswFYsupvlYlJwHyDZDShK48ymvrHMK";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await getAdminByEmail(email);
    const valid = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);

    if (!admin || !valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signAdminToken({ adminId: admin.id, role: admin.role, email: admin.email });

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // no maxAge/expires set -> browser treats this as a session cookie and
        // drops it on close; the JWT's own 4hr exp (from signAdminToken) is the backstop
    });

    return response;
}
