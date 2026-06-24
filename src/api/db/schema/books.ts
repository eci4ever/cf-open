import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	author: text("author").notNull(),
	isbn: text("isbn").unique(),
	publishedYear: integer("published_year"),
	price: real("price"),
	createdAt: text("created_at").notNull().default("(datetime('now'))"),
	updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
});
