import { relations, InferModel } from "drizzle-orm";
import {
  serial,
  text,
  timestamp,
  pgTable,
  uuid,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  username: text("username"),
  name: text("name").notNull().unique(),
  image: text("image"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  phone: text("phone"),
  password: text("password"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).default(
    new Date()
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const userRelations = relations(user, ({ many }) => ({
  post: many(post),
}));

export const account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const session = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export const post = pgTable("post", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title"),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(
    new Date()
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
});

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, { fields: [post.userId], references: [user.id] }),
  image: one(image, {
    fields: [post.id],
    references: [image.postId],
  }),
  product: many(product),
}));

export const image = pgTable("image", {
  id: serial("id").primaryKey().notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(
    new Date()
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" }),
});

export const product = pgTable("product", {
  id: serial("id").primaryKey().notNull(),
  title: text("title"),
  image: text("image"),
  link: text("link").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(
    new Date()
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" }),
});

export const productRelations = relations(product, ({ one }) => ({
  post: one(post, { fields: [product.postId], references: [post.id] }),
}));

export type User = InferModel<typeof user>;
export type Post = InferModel<typeof post>;
export type Image = InferModel<typeof image>;
export type Product = InferModel<typeof product>;
