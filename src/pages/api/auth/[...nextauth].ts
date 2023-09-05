import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { supabase } from "@/lib/supabase";
import { PostgresError } from "postgres";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  secret: "RfhkfD1L5sqLUvCbvijoH0ZRDp2NRp5BYtE2cX9XB3Y=",
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "email" },
        password: { label: "password" },
      },
      async authorize(credentials) {
        try {
          const { data: user, error } = (await supabase
            .from("user")
            .select(
              "id, email, name, displayName:display_name, phone, image, isAdmin:is_admin, isEmailVerified:is_email_verified"
            )
            .match({
              email: credentials?.email!,
              password: credentials?.password!,
            })
            .single()) as unknown as {
            data: { id: string; email: string };
            error: PostgresError;
          };
          if (error || !user) throw error;

          return {
            ...user,
          };
        } catch (error) {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return { id: 1, role: profile.role ?? "user", ...profile };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ account, user, profile, credentials, email }) {
      console.log({ account, user, profile, credentials, email });
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      // @ts-ignore
      if (user) token.role = user.role;
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
