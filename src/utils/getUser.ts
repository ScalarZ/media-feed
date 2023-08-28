import { db } from "@/lib/db";
import { user } from "@/schema";
import { eq } from "drizzle-orm";
import { Session } from "next-auth";

export async function getUserByUsername(username: string) {
  const users = await db
    .select({ id: user.id, username: user.username })
    .from(user)
    .where(eq(user.username, username));

  if (!users.length) throw new Error("No users found");

  return users[0];
}

export function getSessionUser(session: Session | null) {
  return session?.user;
}
