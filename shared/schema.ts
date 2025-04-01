import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Contact schema
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  status: true,
  metadata: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// List schema
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertListSchema = createInsertSchema(lists).pick({
  name: true,
  description: true,
});

export type InsertList = z.infer<typeof insertListSchema>;
export type List = typeof lists.$inferSelect;

// Contact-List relationship
export const contactLists = pgTable("contact_lists", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  listId: integer("list_id").notNull(),
  addedAt: timestamp("added_at").defaultNow()
});

export const insertContactListSchema = createInsertSchema(contactLists).pick({
  contactId: true,
  listId: true,
});

export type InsertContactList = z.infer<typeof insertContactListSchema>;
export type ContactList = typeof contactLists.$inferSelect;

// Campaign schema
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  senderName: text("sender_name").notNull(),
  replyToEmail: text("reply_to_email").notNull(),
  content: text("content"),
  status: text("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata")
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  subject: true,
  previewText: true,
  senderName: true,
  replyToEmail: true,
  content: true,
  status: true,
  scheduledAt: true,
  metadata: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Email schema for individual emails
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertEmailSchema = createInsertSchema(emails).pick({
  to: true,
  subject: true,
  content: true,
  status: true,
  metadata: true,
});

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;

// Template schema
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata")
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  content: true,
  category: true,
  metadata: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Analytics for campaign performance
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  opens: integer("opens").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  bounces: integer("bounces").notNull().default(0),
  unsubscribes: integer("unsubscribes").notNull().default(0),
  date: timestamp("date").defaultNow(),
  metadata: json("metadata")
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  campaignId: true,
  opens: true,
  clicks: true,
  bounces: true,
  unsubscribes: true,
  metadata: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
