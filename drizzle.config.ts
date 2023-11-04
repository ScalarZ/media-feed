import { Config } from "drizzle-kit";

export default {
  driver: "pg",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    connectionString:
      "postgresql://postgres:3B7c44y0qjWqMUQO@db.mnlgmybxfwugjaizllrn.supabase.co:5432/postgres",
  },
} satisfies Config;
