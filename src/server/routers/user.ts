import { z } from "zod";
import { procedure, router } from "../trpc";
import { user, verificationToken } from "@/schema";
import { TRPCError } from "@trpc/server";
import { DrizzleError, eq } from "drizzle-orm";
import { JwtPayload, decode, sign } from "jsonwebtoken";
import { transporter } from "@/utils/createTransport";

const isDrizzleError = (err: unknown): err is DrizzleError =>
  err !== null && typeof err === "object" && "stack" in err;

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
            username,
            email,
            password,
            createdAt: new Date(createdAt),
          });
          return {
            message: "You are signed up successfully",
          };
        } catch (err) {
          if (isDrizzleError(err)) {
            throw new TRPCError({
              code: "CONFLICT",
              message: err.message,
              cause: err,
            });
          }
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
        displayName: z.string(),
        phone: z.string(),
        image: z.string().nullable(),
        updatedAt: z.number(),
      })
    )
    .mutation(
      async ({
        input: { userId, displayName, phone, image, updatedAt },
        ctx: { db },
      }) => {
        try {
          await db
            .update(user)
            .set({
              displayName,
              phone,
              updatedAt: new Date(updatedAt),
              ...(image ? { image } : {}),
            })
            .where(eq(user.id, userId));
          return {
            message: "Account has been updated successfully",
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
  resetPassword: procedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        email: z.string(),
        origin: z.string(),
      })
    )
    .mutation(async ({ input: { userId, email, origin }, ctx: { db } }) => {
      try {
        const code = (Math.random() * 36).toString(36);

        const token = sign(
          {
            userId,
            email,
            code,
          },
          process.env.JWT_SECRET!,
          {
            expiresIn: 5 * 60,
          }
        );

        const payload = decode(token) as JwtPayload;

        await Promise.all([
          transporter.sendMail({
            from: "Fares <jeanne45@ethereal.email>",
            to: email,
            subject: "Resetting password",
            text: `
                  Welcome
                  ${origin}/reset-password?token=${token}
                  `,
            html: `
                  <h1>Welcome 🚀</h1>
                  <a target="_blank" rel="noopener noreferrer" href='${origin}/change-password?token=${token}'>Click here to change your password</a>
                  `,
          }),
          db.insert(verificationToken).values({
            token: code,
            issuedAt: new Date(payload.iat! * 1000),
            expiresAt: new Date(payload.exp! * 1000),
            userId,
          }),
        ]);
        return {
          message: "a verification token has been sent to your email address",
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: err,
        });
      }
    }),
  updatePassword: procedure
    .input(
      z.object({
        userId: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { userId, password }, ctx: { db } }) => {
      try {
        await Promise.all([
          db
            .update(user)
            .set({
              password,
            })
            .where(eq(user.id, userId)),
          db
            .delete(verificationToken)
            .where(eq(verificationToken.userId, userId)),
        ]);
        return {
          message: "Your account password has been updated successfully",
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: err,
        });
      }
    }),
  checkUsername: procedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .mutation(async ({ input: { username }, ctx: { db } }) => {
      try {
        const usernames = await db
          .select({ username: user.username })
          .from(user)
          .where(eq(user.username, username));

        if (!usernames || !usernames.length) {
          return {
            message: "This username is valid",
            valid: true,
          };
        }
        return {
          message: "This username has been taken",
          valid: false,
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
