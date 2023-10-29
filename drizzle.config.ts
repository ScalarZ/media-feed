import { Config } from "drizzle-kit";

export default {
  driver: "pg",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    database: "postgres",
    host: "db.mnlgmybxfwugjaizllrn.supabase.co",
    password: "nDRd2bPaiEcWOOP9",
    port: 5432,
    user: "postgres",
  },
} satisfies Config;
