import { z } from "zod";
import { procedure, router } from "../trpc";
import { user, verificationToken } from "@/schema";
import { TRPCError } from "@trpc/server";
import { DrizzleError, eq } from "drizzle-orm";
import { JwtPayload, decode, sign } from "jsonwebtoken";
import { transporter } from "@/utils/createTransport";
import { selectTemplate } from "@/utils/templates";

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
            name: username,
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
  sendEmail: procedure
    .input(
      z.object({
        userId: z.string().optional(),
        name: z.string().optional(),
        email: z.string(),
        origin: z.string(),
        template: z.enum(["CHANGE_PASSWORD", "RESET_PASSWORD"]),
      })
    )
    .mutation(
      async ({ input: { userId, email, origin, template }, ctx: { db } }) => {
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
          const selectedTemplate = selectTemplate(template, token, origin);
          await Promise.all([
            transporter.sendMail({
              from: "User <josiah.bernier@ethereal.email>",
              to: email,
              ...selectedTemplate,
            }),
            db.insert(verificationToken).values({
              token: code,
              issuedAt: new Date(payload.iat! * 1000),
              expiresAt: new Date(payload.exp! * 1000),
              userEmail: email,
            }),
          ]);
          return {
            message: "a verification token has been sent to your email address",
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
  updatePassword: procedure
    .input(
      z.object({
        userEmail: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { userEmail, password }, ctx: { db } }) => {
      try {
        await Promise.all([
          db
            .update(user)
            .set({
              password,
            })
            .where(eq(user.email, userEmail)),
          db
            .delete(verificationToken)
            .where(eq(verificationToken.userEmail, userEmail)),
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
  forgotPassword: procedure
    .input(
      z.object({
        userEmail: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { userEmail, password }, ctx: { db } }) => {
      try {
        await Promise.all([
          db
            .update(user)
            .set({
              password,
            })
            .where(eq(user.email, userEmail)),
          db
            .delete(verificationToken)
            .where(eq(verificationToken.userEmail, userEmail)),
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
          .select({ username: user.name })
          .from(user)
          .where(eq(user.name, username));

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
