import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

export async function getAdminByEmail(email: string) {
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  return admin ?? null;
}
