import { pgTable, pgEnum, pgSchema, AnyPgColumn, uuid, text, timestamp, boolean, foreignKey, serial } from "drizzle-orm/pg-core"

export const keyStatus = pgEnum("key_status", ['expired', 'invalid', 'valid', 'default'])
export const keyType = pgEnum("key_type", ['stream_xchacha20', 'secretstream', 'secretbox', 'kdf', 'generichash', 'shorthash', 'auth', 'hmacsha256', 'hmacsha512', 'aead-det', 'aead-ietf'])
export const factorType = pgEnum("factor_type", ['webauthn', 'totp'])
export const factorStatus = pgEnum("factor_status", ['verified', 'unverified'])
export const aalLevel = pgEnum("aal_level", ['aal3', 'aal2', 'aal1'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['plain', 's256'])

import { sql } from "drizzle-orm"

export const user = pgTable("user", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	username: text("username"),
	email: text("email"),
	password: text("password"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('2023-08-02 05:16:01.416'),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	displayName: text("display_name"),
	phone: text("phone"),
	isAdmin: boolean("is_admin").default(false),
	picture: text("picture"),
});

export const image = pgTable("image", {
	id: serial("id").primaryKey().notNull(),
	url: text("url"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('2023-08-02 05:16:01.419'),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" } ),
});

export const post = pgTable("post", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	title: text("title"),
	caption: text("caption"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('2023-08-02 05:16:01.418'),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" } ),
});

export const product = pgTable("product", {
	id: serial("id").primaryKey().notNull(),
	title: text("title"),
	image: text("image"),
	link: text("link"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('2023-08-02 05:16:01.419'),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" } ),
});