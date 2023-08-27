import { z } from "zod";
import { procedure, router } from "../trpc";
import { Product, image, post, product } from "@/schema";
import { TRPCError } from "@trpc/server";
import { SQL, and, asc, desc, eq, inArray } from "drizzle-orm";
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
        },
        ctx: { db },
      }) => {
        const createdPost = await db
          .insert(post)
          .values({
            title: postTitle,
            caption: postCaption,
            userId,
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
              ? db
                  .delete(product)
                  .where(
                    and(...deletedProducts.map(({ id }) => eq(product.id, id)))
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
          orderBy: (post, { asc, desc }) => [desc(post.createdAt)],
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
});
