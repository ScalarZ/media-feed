import { z } from "zod";
import { procedure, router } from "../trpc";
import { user } from "@/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const userRouter = router({
  register: procedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        username: z.string(),
        createdAt: z.number(),
      })
    )
    .mutation(
      async ({
        input: { email, password, username, createdAt },
        ctx: { db },
      }) => {
        try {
          await db.insert(user).values({
            name: username,
            email,
            password,
            createdAt: new Date(createdAt),
          });
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
      }
    ),
  update: procedure
    .input(
      z.object({
        userId: z.string(),
        displayname: z.string(),
        phone: z.string(),
        image: z.string().nullable(),
        updatedAt: z.number(),
      })
    )
    .mutation(
      async ({
        input: { userId, displayname, phone, image, updatedAt },
        ctx: { db },
      }) => {
        try {
          await db
            .update(user)
            .set({
              username: displayname,
              phone,
              updatedAt: new Date(updatedAt),
              ...(image ? { image } : {}),
            })
            .where(eq(user.id, userId));
          return {
            message: "Account has been updated successfully",
          };
        } catch (err) {
          console.log(err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred, please try again later.",
            cause: err,
          });
        }
      }
    ),
});
