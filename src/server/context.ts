import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { inferAsyncReturnType } from "@trpc/server";
import { db } from "@/lib/db";

export async function createContext(opts: CreateNextContextOptions) {
  return {
    db,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
