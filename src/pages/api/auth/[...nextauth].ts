import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { authorizeUser, getUserByEmail } from "@/utils/getUser";

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
          const { user, error } = await authorizeUser(
            credentials?.email!,
            credentials?.password!
          );
          if (error || !user) throw error;

          return {
            ...user,
            provider: "email",
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
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (
        (trigger === "signUp" || trigger === "signIn") &&
        // @ts-ignore
        user?.provider !== "email"
      ) {
        const { user: profile, error } = await getUserByEmail(user.email!);
        if (!profile || !profile.isEmailVerified || error)
          throw new Error("email not verified");
        return { ...token, ...profile };
      }
      if (trigger === "update") {
        return { ...token, ...session.user };
      }

      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
};

export default NextAuth(authOptions);
