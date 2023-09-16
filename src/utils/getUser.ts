import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { user } from "@/schema";
import { eq } from "drizzle-orm";
import { Session } from "next-auth";
import { PostgresError } from "postgres";

export async function getUserByUsername(name: string) {
  const users = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.name, name));

  if (!users.length) throw new Error("Users not found");

  return users[0];
}

export async function getUserByEmail(email: string) {
  const { data: user, error } = (await supabase
    .from("user")
    .select(
      "id, email, name, displayname:display_name, phone, image, isAdmin:is_admin, isEmailVerified:is_email_verified"
    )
    .eq("email", email)
    .single()) as unknown as {
    data: { id: string; email: string; isEmailVerified: boolean } | null;
    error: PostgresError;
  };

  return { user, error };
}

export function getSessionUser(session: Session | null) {
  return session?.user;
}

export async function authorizeUser(email: string, password: string) {
  const { data: user, error } = (await supabase
    .from("user")
    .select(
      "id, email, name, displayName:display_name, phone, image, isAdmin:is_admin, isEmailVerified:is_email_verified"
    )
    .match({
      email,
      password,
    })
    .single()) as unknown as {
    data: { id: string; email: string } | null;
    error: PostgresError;
  };

  return { user, error };
}
