import { Config } from "drizzle-kit";

export default {
  driver: "pg",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    connectionString:
      "postgresql://postgres:Mxs1wYDbqyd561Vy@db.mnlgmybxfwugjaizllrn.supabase.co:5432/postgres",
  },
} satisfies Config;
