import { z } from "zod";
import { procedure, router } from "../trpc";
import { user } from "@/schema";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  register: procedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        username: z.string(),
      })
    )
    .mutation(async ({ input: { email, password, username }, ctx: { db } }) => {
      try {
        await db.insert(user).values({ username, email, password });
        return {
          message: "You are signed up successfully",
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: err,
        });
      }
    }),
});
