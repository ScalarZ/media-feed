import { db } from "@/lib/db";
import { user } from "@/schema";
import { eq } from "drizzle-orm";
import { Session } from "next-auth";

export async function getUserByUsername(name: string) {
  const users = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.name, name));

  if (!users.length) throw new Error("Users not found");

  return users[0];
}

export function getSessionUser(session: Session | null) {
  return session?.user;
}
