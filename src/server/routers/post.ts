import { z } from "zod";
import { procedure, router } from "../trpc";
import { image, post, product, user } from "@/schema";
import { TRPCError } from "@trpc/server";
import { SQL, and, eq, gte, ilike, inArray, lte } from "drizzle-orm";
import { Post } from "@/types";
import { getSQL } from "@/utils/getSQL";

export const postRouter = router({
  createPost: procedure
    .input(
      z.object({
        postTitle: z.string(),
        postCaption: z.string(),
        postImage: z.string(),
        userId: z.string(),
        products: z.array(
          z.object({
            title: z.string(),
            link: z.string(),
            image: z.string(),
          })
        ),
        createdAt: z.number(),
      })
    )
    .mutation(
      async ({
        input: {
          userId,
          postTitle,
          postCaption,
          postImage,
          products,
          createdAt,
        },
        ctx: { db },
      }) => {
        const createdPost = await db
          .insert(post)
          .values({
            title: postTitle,
            caption: postCaption,
            userId,
            createdAt: new Date(createdAt),
          })
          .returning();

        await Promise.all([
          db
            .insert(image)
            .values({ postId: createdPost[0].id, url: postImage }),
          db.insert(product).values(
            products.map(({ title, image, link }) => ({
              title,
              image,
              link,
              postId: createdPost[0].id,
            }))
          ),
        ]);

        try {
          return {
            message: "Post has been created successfully",
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
  updatePost: procedure
    .input(
      z.object({
        userId: z.string(),
        postId: z.string(),
        postTitle: z.string().optional(),
        postCaption: z.string().optional(),
        postImage: z.string().optional(),
        addedProducts: z
          .array(
            z.object({
              title: z.string(),
              link: z.string(),
              image: z.string(),
            })
          )
          .optional(),
        updatedProducts: z
          .array(
            z.object({
              id: z.number(),
              title: z.string(),
              link: z.string(),
              image: z.string(),
            })
          )
          .optional(),
        deletedProducts: z.array(z.object({ id: z.number() })).optional(),
      })
    )
    .mutation(
      async ({
        input: {
          userId,
          postId,
          postTitle,
          postCaption,
          postImage,
          addedProducts,
          updatedProducts,
          deletedProducts,
        },
        ctx: { db },
      }) => {
        try {
          let sql:
            | {
                sqlInputs: Record<
                  "id" | "link" | "title" | "image",
                  SQL<unknown>
                >;
                ids: number[];
              }
            | undefined = undefined;
          if (updatedProducts) {
            sql = getSQL<{
              id: number;
              title: string;
              link: string;
              image: string;
            }>(updatedProducts, "link", "title", "image");
          }
          await Promise.all([
            postTitle || postCaption
              ? db
                  .update(post)
                  .set({
                    ...(postTitle ? { title: postTitle } : {}),
                    ...(postCaption ? { caption: postCaption } : {}),
                    updatedAt: new Date(),
                  })
                  .where(eq(post.id, postId))
              : undefined,
            postImage
              ? db
                  .update(image)
                  .set({ url: postImage + `?u=${Date.now()}` })
                  .where(eq(image.postId, postId))
              : undefined,
            addedProducts
              ? db.insert(product).values(
                  addedProducts.map(({ title, image, link }) => ({
                    title,
                    image,
                    link,
                    postId,
                  }))
                )
              : undefined,
            updatedProducts && sql
              ? db
                  .update(product)
                  .set({
                    title: sql.sqlInputs["title"],
                    link: sql.sqlInputs["link"],
                    image: sql.sqlInputs["image"],
                    updatedAt: new Date(),
                  })
                  .where(inArray(product.id, sql.ids))
              : undefined,
            deletedProducts
              ? db.delete(product).where(
                  inArray(
                    product.id,
                    deletedProducts.map(({ id }) => id)
                  )
                )
              : undefined,
          ]);

          return {
            message: "Post has been updated successfully",
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
  deletePost: procedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ input: { postId }, ctx: { db } }) => {
      try {
        await db.delete(post).where(eq(post.id, postId));
        return { message: "Post has been deleted permanently" };
      } catch (err) {
        console.log(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: err,
        });
      }
    }),
  loadPosts: procedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input: { userId }, ctx: { db } }) => {
      try {
        const posts = await db.query.post.findMany({
          with: {
            image: true,
            product: true,
          },
          orderBy: (post, { desc }) => [desc(post.createdAt)],
          where: eq(post.userId, userId),
        });

        return posts as unknown as Post[];
      } catch (err) {
        console.log(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: err,
        });
      }
    }),
  searchPosts: procedure
    .input(
      z.object({
        username: z.string().optional(),
        dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
        status: z.enum(["PENDING", "PUBLISHED", "REJECTED"]).optional(),
      })
    )
    .mutation(
      async ({ input: { username, dateRange, status }, ctx: { db } }) => {
        try {
          let users: { id: string }[] = [];
          if (username) {
            users = await db
              .select({ id: user.id })
              .from(user)
              .where(ilike(user.name, `%${username}%`));
          }
          const posts = await db.query.post.findMany({
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                },
              },
              image: true,
              product: true,
            },
            where: and(
              users.length
                ? inArray(
                    post.userId,
                    users.map(({ id }) => id)
                  )
                : undefined,
              status ? eq(post.status, status) : undefined,
              dateRange
                ? and(
                    gte(post.createdAt, new Date(dateRange.from)),
                    lte(post.createdAt, new Date(dateRange.to))
                  )
                : undefined
            ),
          });

          return posts;
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
  updateStatus: procedure
    .input(
      z.object({
        postId: z.string(),
        status: z.enum(["PENDING", "PUBLISHED", "REJECTED"]),
      })
    )
    .mutation(async ({ input: { postId, status }, ctx: { db } }) => {
      try {
        const posts = await db
          .update(post)
          .set({ status })
          .where(eq(post.id, postId));
        return {
          message: "Post status has been updated successfully",
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred, please try again later.",
          cause: err,
        });
      }
    }),
});
