// lib/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const FOUR_HOURS = 60 * 60 * 4;

export interface AdminTokenPayload {
    adminId: number;
    role: string;
    email: string;
}

export async function signAdminToken(payload: AdminTokenPayload) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${FOUR_HOURS}s`)
        .sign(secret);
}

export async function verifyAdminToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as AdminTokenPayload;
    } catch {
        console.log("VERIFY ADMIN CATCH BLOCK: ", token)
        return null; // expired, tampered, or malformed — treat all the same as "not authenticated"
    }
}
