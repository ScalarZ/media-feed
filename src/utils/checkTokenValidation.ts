import { db } from "@/lib/db";
import { verificationToken } from "@/schema";
import { desc, eq } from "drizzle-orm";
import { JwtPayload } from "jsonwebtoken";

export async function checkTokenValidation(payload: JwtPayload) {
  const token = await db
    .select()
    .from(verificationToken)
    .where(eq(verificationToken.userEmail, payload.email))
    .orderBy(desc(verificationToken.id))
    .limit(1);

  if (!token || !token.length || token[0].token !== payload.code) return false;

  return true;
}
