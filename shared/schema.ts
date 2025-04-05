import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations as defineRelations } from "drizzle-orm";

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull().default("active"),
  industry: text("industry"),
  createdAt: timestamp("created_at").defaultNow(),
  totalSpend: integer("total_spend").default(0),
  emailCredits: integer("email_credits").default(0),
  emailCreditsPurchased: integer("email_credits_purchased").default(0),
  emailCreditsUsed: integer("email_credits_used").default(0),
  lastCreditUpdateAt: timestamp("last_credit_update_at"),
  lastCampaignAt: timestamp("last_campaign_at"),
  avatar: text("avatar"),
  metadata: json("metadata")
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  email: true,
  company: true,
  status: true,
  industry: true,
  totalSpend: true,
  emailCredits: true,
  emailCreditsPurchased: true,
  emailCreditsUsed: true,
  avatar: true,
  metadata: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// User schema (for administrators)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("admin"),
  status: text("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  avatarUrl: text("avatar_url"),
  metadata: json("metadata")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  avatarUrl: true,
  metadata: true,
});

export const userLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

export type UserLogin = z.infer<typeof userLoginSchema>;
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
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  listId: integer("list_id").notNull().references(() => lists.id),
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
  isAbTest: boolean("is_ab_test").default(false),
  winningVariantId: integer("winning_variant_id"),
  clientId: integer("client_id"),
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
  isAbTest: true,
  winningVariantId: true,
  clientId: true,
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
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
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

// Campaign Variants for A/B Testing
export const campaignVariants = pgTable("campaign_variants", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  content: text("content"),
  weight: integer("weight").notNull().default(50), // percentage of recipients who will receive this variant
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata")
});

export const insertCampaignVariantSchema = createInsertSchema(campaignVariants).pick({
  campaignId: true,
  name: true,
  subject: true,
  previewText: true,
  content: true,
  weight: true,
  metadata: true,
});

export type InsertCampaignVariant = z.infer<typeof insertCampaignVariantSchema>;
export type CampaignVariant = typeof campaignVariants.$inferSelect;

// Variant Analytics for A/B Testing
export const variantAnalytics = pgTable("variant_analytics", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id").notNull().references(() => campaignVariants.id),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  recipients: integer("recipients").notNull().default(0),
  opens: integer("opens").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  bounces: integer("bounces").notNull().default(0),
  unsubscribes: integer("unsubscribes").notNull().default(0),
  date: timestamp("date").defaultNow(),
  metadata: json("metadata")
});

export const insertVariantAnalyticsSchema = createInsertSchema(variantAnalytics).pick({
  variantId: true,
  campaignId: true,
  recipients: true,
  opens: true,
  clicks: true,
  bounces: true,
  unsubscribes: true,
  metadata: true,
});

export type InsertVariantAnalytics = z.infer<typeof insertVariantAnalyticsSchema>;
export type VariantAnalytics = typeof variantAnalytics.$inferSelect;

// Domains for sending emails
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: text("status").notNull().default("active"), // active, inactive, pending, failed
  verified: boolean("verified").notNull().default(false),
  defaultDomain: boolean("default_domain").notNull().default(false),
  dkimVerified: boolean("dkim_verified").default(false),
  spfVerified: boolean("spf_verified").default(false),
  dmarcVerified: boolean("dmarc_verified").default(false),
  dkimSelector: text("dkim_selector").default("infy"),
  dkimValue: text("dkim_value"),
  spfValue: text("spf_value"),
  dmarcValue: text("dmarc_value"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  metadata: json("metadata")
});

export const insertDomainSchema = createInsertSchema(domains).pick({
  name: true,
  status: true,
  verified: true,
  defaultDomain: true,
  dkimVerified: true,
  spfVerified: true,
  dmarcVerified: true,
  dkimSelector: true,
  dkimValue: true,
  spfValue: true,
  dmarcValue: true,
  metadata: true,
});

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

// Campaign and Domain relationship
export const campaignDomains = pgTable("campaign_domains", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertCampaignDomainSchema = createInsertSchema(campaignDomains).pick({
  campaignId: true,
  domainId: true,
  metadata: true,
});

export type InsertCampaignDomain = z.infer<typeof insertCampaignDomainSchema>;
export type CampaignDomain = typeof campaignDomains.$inferSelect;

// Client User credentials for client login
export const clientUsers = pgTable("client_users", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  permissions: json("permissions").default({}), // Store feature permissions
  metadata: json("metadata")
});

export const insertClientUserSchema = createInsertSchema(clientUsers).pick({
  clientId: true,
  username: true,
  password: true,
  status: true,
  permissions: true,
  metadata: true,
});

export const clientUserLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

export type ClientUserLogin = z.infer<typeof clientUserLoginSchema>;
export type InsertClientUser = z.infer<typeof insertClientUserSchema>;
export type ClientUser = typeof clientUsers.$inferSelect;

// Define table relations
export const usersRelations = defineRelations(users, {
  // No relations for users yet
});

export const clientsRelations = defineRelations(clients, {
  clientUsers: { relationName: "client_to_users", fields: [clients.id], references: [clientUsers.clientId] },
  campaigns: { relationName: "client_to_campaigns", fields: [clients.id], references: [campaigns.clientId] }
});

export const contactsRelations = defineRelations(contacts, {
  contactLists: { relationName: "contact_to_contactLists", fields: [contacts.id], references: [contactLists.contactId] }
});

export const listsRelations = defineRelations(lists, {
  contactLists: { relationName: "list_to_contactLists", fields: [lists.id], references: [contactLists.listId] }
});

export const contactListsRelations = defineRelations(contactLists, {
  contact: { relationName: "contactList_to_contact", fields: [contactLists.contactId], references: [contacts.id] },
  list: { relationName: "contactList_to_list", fields: [contactLists.listId], references: [lists.id] }
});

export const campaignsRelations = defineRelations(campaigns, {
  variants: { relationName: "campaign_to_variants", fields: [campaigns.id], references: [campaignVariants.campaignId] },
  analytics: { relationName: "campaign_to_analytics", fields: [campaigns.id], references: [analytics.campaignId] },
  campaignDomains: { relationName: "campaign_to_campaignDomains", fields: [campaigns.id], references: [campaignDomains.campaignId] },
  client: { relationName: "campaign_to_client", fields: [campaigns.clientId], references: [clients.id] }
});

export const campaignVariantsRelations = defineRelations(campaignVariants, {
  campaign: { relationName: "variant_to_campaign", fields: [campaignVariants.campaignId], references: [campaigns.id] },
  variantAnalytics: { relationName: "variant_to_analytics", fields: [campaignVariants.id], references: [variantAnalytics.variantId] }
});

export const analyticsRelations = defineRelations(analytics, {
  campaign: { relationName: "analytics_to_campaign", fields: [analytics.campaignId], references: [campaigns.id] }
});

export const variantAnalyticsRelations = defineRelations(variantAnalytics, {
  variant: { relationName: "variantAnalytics_to_variant", fields: [variantAnalytics.variantId], references: [campaignVariants.id] },
  campaign: { relationName: "variantAnalytics_to_campaign", fields: [variantAnalytics.campaignId], references: [campaigns.id] }
});

export const domainsRelations = defineRelations(domains, {
  campaignDomains: { relationName: "domain_to_campaignDomains", fields: [domains.id], references: [campaignDomains.domainId] }
});

export const campaignDomainsRelations = defineRelations(campaignDomains, {
  campaign: { relationName: "campaignDomain_to_campaign", fields: [campaignDomains.campaignId], references: [campaigns.id] },
  domain: { relationName: "campaignDomain_to_domain", fields: [campaignDomains.domainId], references: [domains.id] }
});

export const clientUsersRelations = defineRelations(clientUsers, {
  client: { relationName: "clientUser_to_client", fields: [clientUsers.clientId], references: [clients.id] }
});

// Advanced Analytics - Click Events (for tracking individual link clicks)
export const clickEvents = pgTable("click_events", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  emailId: integer("email_id").references(() => emails.id),
  contactId: integer("contact_id").references(() => contacts.id),
  url: text("url").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  country: text("country"),
  city: text("city"),
  metadata: json("metadata")
});

export const insertClickEventSchema = createInsertSchema(clickEvents).pick({
  campaignId: true,
  emailId: true,
  contactId: true,
  url: true,
  ipAddress: true,
  userAgent: true,
  deviceType: true,
  browser: true,
  os: true,
  country: true,
  city: true,
  metadata: true,
});

export type InsertClickEvent = z.infer<typeof insertClickEventSchema>;
export type ClickEvent = typeof clickEvents.$inferSelect;

// Open Events (for tracking individual email opens)
export const openEvents = pgTable("open_events", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  emailId: integer("email_id").references(() => emails.id),
  contactId: integer("contact_id").references(() => contacts.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  country: text("country"),
  city: text("city"),
  metadata: json("metadata")
});

export const insertOpenEventSchema = createInsertSchema(openEvents).pick({
  campaignId: true,
  emailId: true,
  contactId: true,
  ipAddress: true,
  userAgent: true,
  deviceType: true,
  browser: true,
  os: true,
  country: true,
  city: true,
  metadata: true,
});

export type InsertOpenEvent = z.infer<typeof insertOpenEventSchema>;
export type OpenEvent = typeof openEvents.$inferSelect;

// Detailed Engagement Metrics (for aggregated engagement data)
export const engagementMetrics = pgTable("engagement_metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  date: timestamp("date").defaultNow().notNull(),
  totalOpens: integer("total_opens").default(0),
  uniqueOpens: integer("unique_opens").default(0),
  totalClicks: integer("total_clicks").default(0),
  uniqueClicks: integer("unique_clicks").default(0),
  clickThroughRate: integer("click_through_rate").default(0), // Stored as integer (percentage * 100)
  averageEngagementTime: integer("average_engagement_time").default(0), // in seconds
  engagementScore: integer("engagement_score").default(0), // 0-100
  mostClickedLink: text("most_clicked_link"),
  mostActiveHour: integer("most_active_hour"), // 0-23
  mostActiveDevice: text("most_active_device"),
  metadata: json("metadata")
});

export const insertEngagementMetricsSchema = createInsertSchema(engagementMetrics).pick({
  campaignId: true,
  date: true,
  totalOpens: true,
  uniqueOpens: true,
  totalClicks: true,
  uniqueClicks: true,
  clickThroughRate: true,
  averageEngagementTime: true,
  engagementScore: true,
  mostClickedLink: true,
  mostActiveHour: true,
  mostActiveDevice: true,
  metadata: true,
});

export type InsertEngagementMetrics = z.infer<typeof insertEngagementMetricsSchema>;
export type EngagementMetrics = typeof engagementMetrics.$inferSelect;

// Link Tracking table for URLs in campaigns
export const linkTracking = pgTable("link_tracking", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  originalUrl: text("original_url").notNull(),
  trackingUrl: text("tracking_url").notNull(),
  clickCount: integer("click_count").default(0),
  uniqueClickCount: integer("unique_click_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertLinkTrackingSchema = createInsertSchema(linkTracking).pick({
  campaignId: true,
  originalUrl: true,
  trackingUrl: true,
  clickCount: true,
  uniqueClickCount: true,
  metadata: true,
});

export type InsertLinkTracking = z.infer<typeof insertLinkTrackingSchema>;
export type LinkTracking = typeof linkTracking.$inferSelect;

// Define relations for the new tables
export const clickEventsRelations = defineRelations(clickEvents, {
  campaign: { relationName: "clickEvent_to_campaign", fields: [clickEvents.campaignId], references: [campaigns.id] },
  email: { relationName: "clickEvent_to_email", fields: [clickEvents.emailId], references: [emails.id] },
  contact: { relationName: "clickEvent_to_contact", fields: [clickEvents.contactId], references: [contacts.id] }
});

export const openEventsRelations = defineRelations(openEvents, {
  campaign: { relationName: "openEvent_to_campaign", fields: [openEvents.campaignId], references: [campaigns.id] },
  email: { relationName: "openEvent_to_email", fields: [openEvents.emailId], references: [emails.id] },
  contact: { relationName: "openEvent_to_contact", fields: [openEvents.contactId], references: [contacts.id] }
});

export const engagementMetricsRelations = defineRelations(engagementMetrics, {
  campaign: { relationName: "engagementMetric_to_campaign", fields: [engagementMetrics.campaignId], references: [campaigns.id] }
});

export const linkTrackingRelations = defineRelations(linkTracking, {
  campaign: { relationName: "linkTracking_to_campaign", fields: [linkTracking.campaignId], references: [campaigns.id] }
});

// Update campaigns relations to include tracking tables (added after those tables are defined)
export const campaignsTrackingRelations = {
  clickEvents: { relationName: "campaign_to_clickEvents", fields: [campaigns.id], references: [clickEvents.campaignId] },
  openEvents: { relationName: "campaign_to_openEvents", fields: [campaigns.id], references: [openEvents.campaignId] },
  engagementMetrics: { relationName: "campaign_to_engagementMetrics", fields: [campaigns.id], references: [engagementMetrics.campaignId] },
  linkTracking: { relationName: "campaign_to_linkTracking", fields: [campaigns.id], references: [linkTracking.campaignId] }
};

// Client Email Credits History schema
export const clientEmailCreditsHistory = pgTable("client_email_credits_history", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'add', 'deduct', 'set'
  previousBalance: integer("previous_balance").notNull(),
  newBalance: integer("new_balance").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertClientEmailCreditsHistorySchema = createInsertSchema(clientEmailCreditsHistory).pick({
  clientId: true,
  amount: true,
  type: true,
  previousBalance: true,
  newBalance: true,
  reason: true,
  metadata: true,
});

export type InsertClientEmailCreditsHistory = z.infer<typeof insertClientEmailCreditsHistorySchema>;
export type ClientEmailCreditsHistory = typeof clientEmailCreditsHistory.$inferSelect;

export const clientEmailCreditsHistoryRelations = defineRelations(clientEmailCreditsHistory, {
  client: { relationName: "clientEmailCreditsHistory_to_client", fields: [clientEmailCreditsHistory.clientId], references: [clients.id] }
});
