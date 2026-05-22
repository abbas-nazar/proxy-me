import { pgTable, uuid, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  slug: text("slug").unique().notNull(),
  displayName: text("display_name"),
  headline: text("headline"),
  isPublic: boolean("is_public").default(true),
  personality: text("personality"),
  suggestedQuestions: jsonb("suggested_questions").default([]),
  contactCollection: jsonb("contact_collection").default({ enabled: false, requireName: false, requireEmail: false }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const profileSections = pgTable("profile_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title"),
  content: jsonb("content").notNull(),
  source: text("source").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const visitorContacts = pgTable("visitor_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  visitorFingerprint: text("visitor_fingerprint"),
  messages: jsonb("messages").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})
