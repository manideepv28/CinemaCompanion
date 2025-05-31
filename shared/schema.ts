import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  favorites: jsonb("favorites").$type<number[]>().default([]),
});

export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'documentary' | 'music'
  genre: text("genre").notNull(),
  year: integer("year").notNull(),
  rating: integer("rating").notNull(), // scaled by 10 (8.5 -> 85)
  duration: text("duration").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  director: text("director"),
  artist: text("artist"),
  imdbId: text("imdb_id"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  favorites: true,
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;
