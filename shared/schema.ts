import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, doublePrecision, date, real } from "drizzle-orm/pg-core";
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

// User schema (for administrators and staff)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  status: text("status").notNull().default("active"),
  role: text("role").default("user"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  avatarUrl: text("avatar_url"),
  metadata: json("metadata"),
  twofa_enabled: boolean("twofa_enabled").notNull().default(false),
  twofa_secret: text("twofa_secret"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  status: true,
  role: true,
  avatarUrl: true,
  metadata: true,
});

// Roles definition
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false), // System roles cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata")
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
  isSystem: true,
  metadata: true,
});

// Permissions definition
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(), // Group permissions by category (e.g., campaigns, users, templates)
  action: text("action").notNull(), // The action this permission grants (e.g., view, create, edit, delete)
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  name: true,
  description: true,
  category: true,
  action: true,
  metadata: true,
});

// Role-Permission relationship
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  permissionId: integer("permission_id").notNull().references(() => permissions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).pick({
  roleId: true,
  permissionId: true,
});

// User-Role relationship
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).pick({
  userId: true,
  roleId: true,
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

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
  clientId: integer("client_id").references(() => clients.id),
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
  requireDoubleOptIn: boolean("require_double_opt_in").default(false).notNull(),
  sendWelcomeEmail: boolean("send_welcome_email").default(false).notNull(),
  tags: text("tags").array(),
  clientId: integer("client_id").references(() => clients.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertListSchema = createInsertSchema(lists).pick({
  name: true,
  description: true,
  requireDoubleOptIn: true,
  sendWelcomeEmail: true,
  tags: true,
  clientId: true
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
  content: text("content").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("general"),
  description: text("description"),
  clientId: integer("client_id").references(() => clients.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isGlobal: boolean("is_global").default(false),
  isPromoted: boolean("is_promoted").default(false),
  popularity: integer("popularity").default(0),
  rating: real("rating").default(0),
  metadata: json("metadata")
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  content: true,
  subject: true,
  category: true,
  description: true,
  clientId: true,
  isGlobal: true,
  isPromoted: true,
  popularity: true,
  rating: true,
  metadata: true,
});

export type InsertTemplate = {
  name: string;
  content: string;
  subject: string;
  category: string;
  description?: string;
  clientId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isGlobal?: boolean;
  isPromoted?: boolean;
  popularity?: number;
  rating?: number;
  metadata?: any;
};

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
  // No separate permissions column - permissions are stored in metadata
  metadata: json("metadata")
});

export const insertClientUserSchema = createInsertSchema(clientUsers).pick({
  clientId: true,
  username: true,
  password: true,
  status: true,
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

// Template Categories and Tags for smart recommendations
export const templateTags = pgTable("template_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertTemplateTagSchema = createInsertSchema(templateTags).pick({
  name: true,
  description: true,
  metadata: true,
});

export type InsertTemplateTag = z.infer<typeof insertTemplateTagSchema>;
export type TemplateTag = typeof templateTags.$inferSelect;

// Template-Tag relationship
export const templateTagRelations = pgTable("template_tag_relations", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => templates.id),
  tagId: integer("tag_id").notNull().references(() => templateTags.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTemplateTagRelationSchema = createInsertSchema(templateTagRelations).pick({
  templateId: true,
  tagId: true,
});

export type InsertTemplateTagRelation = z.infer<typeof insertTemplateTagRelationSchema>;
export type TemplateTagRelation = typeof templateTagRelations.$inferSelect;

// Template Usage Statistics for recommendations
export const templateUsageStats = pgTable("template_usage_stats", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => templates.id),
  clientId: integer("client_id").references(() => clients.id),
  totalUsage: integer("total_usage").notNull().default(0),
  openRate: real("open_rate"),  // percentage
  clickRate: real("click_rate"), // percentage
  bounceRate: real("bounce_rate"), // percentage
  conversionRate: real("conversion_rate"), // percentage
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata")
});

export const insertTemplateUsageStatSchema = createInsertSchema(templateUsageStats).pick({
  templateId: true,
  clientId: true,
  totalUsage: true,
  openRate: true,
  clickRate: true,
  bounceRate: true,
  conversionRate: true,
  lastUsedAt: true,
  metadata: true,
});

export type InsertTemplateUsageStat = z.infer<typeof insertTemplateUsageStatSchema>;
export type TemplateUsageStat = typeof templateUsageStats.$inferSelect;

// Industry-specific template recommendations 
export const industryTemplateRecommendations = pgTable("industry_template_recommendations", {
  id: serial("id").primaryKey(),
  industry: text("industry").notNull(),
  templateId: integer("template_id").notNull().references(() => templates.id),
  rank: integer("rank").notNull().default(0), // Higher rank = higher priority
  relevanceScore: real("relevance_score").notNull().default(0), // 0-100 score
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata")
});

export const insertIndustryTemplateRecommendationSchema = createInsertSchema(industryTemplateRecommendations).pick({
  industry: true,
  templateId: true,
  rank: true,
  relevanceScore: true,
  metadata: true,
});

export type InsertIndustryTemplateRecommendation = z.infer<typeof insertIndustryTemplateRecommendationSchema>;
export type IndustryTemplateRecommendation = typeof industryTemplateRecommendations.$inferSelect;

// Template recommendations by AI
export const templateRecommendations = pgTable("template_recommendations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  templateId: integer("template_id").notNull().references(() => templates.id),
  score: real("score").notNull().default(0), // 0-100 recommendation score
  reason: text("reason"), // Human-readable reason for recommendation
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Recommendations expire after a certain period
  status: text("status").notNull().default("active"), // active, dismissed, used, expired
  metadata: json("metadata")
});

export const insertTemplateRecommendationSchema = createInsertSchema(templateRecommendations).pick({
  clientId: true,
  templateId: true,
  score: true,
  reason: true,
  expiresAt: true,
  status: true,
  metadata: true,
});

export type InsertTemplateRecommendation = z.infer<typeof insertTemplateRecommendationSchema>;
export type TemplateRecommendation = typeof templateRecommendations.$inferSelect;

// Define table relations
export const usersRelations = defineRelations(users, {
  userRoles: { relationName: "user_to_roles", fields: [users.id], references: [userRoles.userId] }
});

export const rolesRelations = defineRelations(roles, {
  userRoles: { relationName: "role_to_users", fields: [roles.id], references: [userRoles.roleId] },
  rolePermissions: { relationName: "role_to_permissions", fields: [roles.id], references: [rolePermissions.roleId] }
});

export const permissionsRelations = defineRelations(permissions, {
  rolePermissions: { relationName: "permission_to_roles", fields: [permissions.id], references: [rolePermissions.permissionId] }
});

export const rolePermissionsRelations = defineRelations(rolePermissions, {
  role: { relationName: "rolePermission_to_role", fields: [rolePermissions.roleId], references: [roles.id] },
  permission: { relationName: "rolePermission_to_permission", fields: [rolePermissions.permissionId], references: [permissions.id] }
});

export const userRolesRelations = defineRelations(userRoles, {
  user: { relationName: "userRole_to_user", fields: [userRoles.userId], references: [users.id] },
  role: { relationName: "userRole_to_role", fields: [userRoles.roleId], references: [roles.id] }
});

// Email Providers table
export const emailProviders = pgTable("email_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // sendgrid, mailgun, amazonses, sendclean, smtp
  config: json("config").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertEmailProviderSchema = createInsertSchema(emailProviders).pick({
  name: true,
  provider: true,
  config: true,
  isDefault: true
});

export type InsertEmailProvider = z.infer<typeof insertEmailProviderSchema>;
export type EmailProvider = typeof emailProviders.$inferSelect;

// Client to Provider relationships
export const clientProviders = pgTable("client_providers", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  providerId: integer("provider_id").notNull().references(() => emailProviders.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertClientProviderSchema = createInsertSchema(clientProviders).pick({
  clientId: true,
  providerId: true
});

export type InsertClientProvider = z.infer<typeof insertClientProviderSchema>;
export type ClientProvider = typeof clientProviders.$inferSelect;

export const clientsRelations = defineRelations(clients, {
  clientUsers: { relationName: "client_to_users", fields: [clients.id], references: [clientUsers.clientId] },
  campaigns: { relationName: "client_to_campaigns", fields: [clients.id], references: [campaigns.clientId] },
  clientProviders: { relationName: "client_to_providers", fields: [clients.id], references: [clientProviders.clientId] },
  templates: { relationName: "client_to_templates", fields: [clients.id], references: [templates.clientId] },
  templateRecommendations: { relationName: "client_to_recommendations", fields: [clients.id], references: [templateRecommendations.clientId] },
  templateUsageStats: { relationName: "client_to_templateUsage", fields: [clients.id], references: [templateUsageStats.clientId] }
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

export const templatesRelations = defineRelations(templates, {
  client: { relationName: "template_to_client", fields: [templates.clientId], references: [clients.id] },
  templateTagRelations: { relationName: "template_to_tagRelations", fields: [templates.id], references: [templateTagRelations.templateId] },
  templateUsageStats: { relationName: "template_to_usageStats", fields: [templates.id], references: [templateUsageStats.templateId] },
  industryRecommendations: { relationName: "template_to_industryRecs", fields: [templates.id], references: [industryTemplateRecommendations.templateId] },
  recommendations: { relationName: "template_to_recommendations", fields: [templates.id], references: [templateRecommendations.templateId] }
});

export const templateTagsRelations = defineRelations(templateTags, {
  templateTagRelations: { relationName: "tag_to_relations", fields: [templateTags.id], references: [templateTagRelations.tagId] }
});

export const templateTagRelationsRelations = defineRelations(templateTagRelations, {
  template: { relationName: "tagRelation_to_template", fields: [templateTagRelations.templateId], references: [templates.id] },
  tag: { relationName: "tagRelation_to_tag", fields: [templateTagRelations.tagId], references: [templateTags.id] }
});

export const templateUsageStatsRelations = defineRelations(templateUsageStats, {
  template: { relationName: "stats_to_template", fields: [templateUsageStats.templateId], references: [templates.id] },
  client: { relationName: "stats_to_client", fields: [templateUsageStats.clientId], references: [clients.id] }
});

export const industryTemplateRecommendationsRelations = defineRelations(industryTemplateRecommendations, {
  template: { relationName: "industryRec_to_template", fields: [industryTemplateRecommendations.templateId], references: [templates.id] }
});

export const templateRecommendationsRelations = defineRelations(templateRecommendations, {
  template: { relationName: "rec_to_template", fields: [templateRecommendations.templateId], references: [templates.id] },
  client: { relationName: "rec_to_client", fields: [templateRecommendations.clientId], references: [clients.id] }
});

// REMOVED: Audience Persona Builder - Personas
// Schema definitions kept for database compatibility but feature removed from UI
export const audiencePersonas = pgTable("audience_personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  clientId: integer("client_id").references(() => clients.id),
  isDefault: boolean("is_default").default(false),
  status: text("status").notNull().default("active"),
  metadata: json("metadata"),
  imageUrl: text("image_url"),
  traits: json("traits").default({})
});

// REMOVED: Schema removed from UI but kept for DB compatibility
export const insertAudiencePersonaSchema = createInsertSchema(audiencePersonas).pick({
  name: true,
  description: true,
  clientId: true,
  isDefault: true,
  status: true,
  metadata: true,
  imageUrl: true,
  traits: true
});

export type InsertAudiencePersona = z.infer<typeof insertAudiencePersonaSchema>;
export type AudiencePersona = typeof audiencePersonas.$inferSelect;

// REMOVED: Audience Segments
export const audienceSegments = pgTable("audience_segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  personaId: integer("persona_id").references(() => audiencePersonas.id),
  clientId: integer("client_id").references(() => clients.id),
  rules: json("rules").notNull(),
  status: text("status").notNull().default("active"),
  metadata: json("metadata")
});

// REMOVED: Schema removed from UI but kept for DB compatibility
export const insertAudienceSegmentSchema = createInsertSchema(audienceSegments).pick({
  name: true,
  description: true,
  personaId: true,
  clientId: true,
  rules: true,
  status: true,
  metadata: true
});

export type InsertAudienceSegment = z.infer<typeof insertAudienceSegmentSchema>;
export type AudienceSegment = typeof audienceSegments.$inferSelect;

// REMOVED: Persona Demographics
export const personaDemographics = pgTable("persona_demographics", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").notNull().references(() => audiencePersonas.id),
  ageRange: text("age_range"),
  gender: text("gender"),
  location: text("location"),
  income: text("income"),
  education: text("education"),
  occupation: text("occupation"),
  maritalStatus: text("marital_status"),
  metadata: json("metadata")
});

// REMOVED: Schema removed from UI but kept for DB compatibility
export const insertPersonaDemographicSchema = createInsertSchema(personaDemographics).pick({
  personaId: true,
  ageRange: true,
  gender: true,
  location: true,
  income: true,
  education: true,
  occupation: true,
  maritalStatus: true,
  metadata: true
});

export type InsertPersonaDemographic = z.infer<typeof insertPersonaDemographicSchema>;
export type PersonaDemographic = typeof personaDemographics.$inferSelect;

// REMOVED: Persona Behaviors
export const personaBehaviors = pgTable("persona_behaviors", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").notNull().references(() => audiencePersonas.id),
  purchaseFrequency: text("purchase_frequency"),
  browserUsage: text("browser_usage"),
  devicePreference: text("device_preference"),
  emailOpenRate: doublePrecision("email_open_rate"),
  clickThroughRate: doublePrecision("click_through_rate"),
  socialMediaUsage: json("social_media_usage"),
  interests: json("interests"),
  metadata: json("metadata")
});

// REMOVED: Schema removed from UI but kept for DB compatibility
export const insertPersonaBehaviorSchema = createInsertSchema(personaBehaviors).pick({
  personaId: true,
  purchaseFrequency: true,
  browserUsage: true,
  devicePreference: true,
  emailOpenRate: true,
  clickThroughRate: true,
  socialMediaUsage: true,
  interests: true,
  metadata: true
});

export type InsertPersonaBehavior = z.infer<typeof insertPersonaBehaviorSchema>;
export type PersonaBehavior = typeof personaBehaviors.$inferSelect;

// REMOVED: Audience Persona Insights
export const personaInsights = pgTable("persona_insights", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").notNull().references(() => audiencePersonas.id),
  insightType: text("insight_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  score: doublePrecision("score"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

// REMOVED: Schema removed from UI but kept for DB compatibility
export const insertPersonaInsightSchema = createInsertSchema(personaInsights).pick({
  personaId: true,
  insightType: true,
  title: true,
  description: true,
  score: true,
  metadata: true
});

export type InsertPersonaInsight = z.infer<typeof insertPersonaInsightSchema>;
export type PersonaInsight = typeof personaInsights.$inferSelect;

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

// Email interaction heat maps
export const emailHeatMaps = pgTable("email_heat_maps", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").notNull().references(() => emails.id),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  heatMapData: json("heat_map_data").notNull().default({}),
  interactionCount: integer("interaction_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailHeatMapSchema = createInsertSchema(emailHeatMaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmailHeatMap = z.infer<typeof insertEmailHeatMapSchema>;
export type EmailHeatMap = typeof emailHeatMaps.$inferSelect;

// Interaction data points for precise tracking
export const interactionDataPoints = pgTable("interaction_data_points", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").notNull().references(() => emails.id),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  contactId: integer("contact_id").references(() => contacts.id),
  elementId: text("element_id"), // The HTML element ID that was interacted with
  elementType: text("element_type"), // Type of element (button, image, text, etc)
  xCoordinate: integer("x_coordinate").notNull(), // X coordinate of interaction (normalized to percentage of width)
  yCoordinate: integer("y_coordinate").notNull(), // Y coordinate of interaction (normalized to percentage of height)
  interactionType: text("interaction_type").notNull(), // Type of interaction (click, hover, scroll)
  interactionDuration: integer("interaction_duration"), // Duration of interaction in milliseconds (for hovers)
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: json("metadata").default({}),
});

export const insertInteractionDataPointSchema = createInsertSchema(interactionDataPoints).omit({
  id: true,
  timestamp: true,
});

export type InsertInteractionDataPoint = z.infer<typeof insertInteractionDataPointSchema>;
export type InteractionDataPoint = typeof interactionDataPoints.$inferSelect;

// Define relations for heat map tables
export const emailHeatMapsRelations = defineRelations(emailHeatMaps, {
  email: { relationName: "heatMap_to_email", fields: [emailHeatMaps.emailId], references: [emails.id] },
  campaign: { relationName: "heatMap_to_campaign", fields: [emailHeatMaps.campaignId], references: [campaigns.id] }
});

export const interactionDataPointsRelations = defineRelations(interactionDataPoints, {
  email: { relationName: "dataPoint_to_email", fields: [interactionDataPoints.emailId], references: [emails.id] },
  campaign: { relationName: "dataPoint_to_campaign", fields: [interactionDataPoints.campaignId], references: [campaigns.id] },
  contact: { relationName: "dataPoint_to_contact", fields: [interactionDataPoints.contactId], references: [contacts.id] }
});

// Update campaigns relations to include tracking tables (added after those tables are defined)
export const campaignsTrackingRelations = {
  clickEvents: { relationName: "campaign_to_clickEvents", fields: [campaigns.id], references: [clickEvents.campaignId] },
  openEvents: { relationName: "campaign_to_openEvents", fields: [campaigns.id], references: [openEvents.campaignId] },
  engagementMetrics: { relationName: "campaign_to_engagementMetrics", fields: [campaigns.id], references: [engagementMetrics.campaignId] },
  linkTracking: { relationName: "campaign_to_linkTracking", fields: [campaigns.id], references: [linkTracking.campaignId] },
  heatMaps: { relationName: "campaign_to_heatMaps", fields: [campaigns.id], references: [emailHeatMaps.campaignId] },
  interactionDataPoints: { relationName: "campaign_to_interactionDataPoints", fields: [campaigns.id], references: [interactionDataPoints.campaignId] }
};

// System Credits schema
export const systemCredits = pgTable("system_credits", {
  id: serial("id").primaryKey(),
  totalCredits: integer("total_credits").notNull().default(0),
  allocatedCredits: integer("allocated_credits").notNull().default(0),
  availableCredits: integer("available_credits").notNull().default(0),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export const insertSystemCreditsSchema = createInsertSchema(systemCredits).pick({
  totalCredits: true,
  allocatedCredits: true,
  availableCredits: true,
});

export type InsertSystemCredits = z.infer<typeof insertSystemCreditsSchema>;
export type SystemCredits = typeof systemCredits.$inferSelect;

// System Credits History schema
export const systemCreditsHistory = pgTable("system_credits_history", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'add', 'allocate', 'deallocate'
  previousBalance: integer("previous_balance").notNull(),
  newBalance: integer("new_balance").notNull(),
  reason: text("reason"),
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const insertSystemCreditsHistorySchema = createInsertSchema(systemCreditsHistory).pick({
  amount: true,
  type: true,
  previousBalance: true,
  newBalance: true,
  reason: true,
  performedBy: true,
  metadata: true,
});

export type InsertSystemCreditsHistory = z.infer<typeof insertSystemCreditsHistorySchema>;
export type SystemCreditsHistory = typeof systemCreditsHistory.$inferSelect;

// Client Email Credits History schema
export const clientEmailCreditsHistory = pgTable("client_email_credits_history", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'add', 'deduct', 'set'
  previousBalance: integer("previous_balance").notNull(),
  newBalance: integer("new_balance").notNull(),
  reason: text("reason"),
  performedBy: integer("performed_by").references(() => users.id),
  systemCreditsDeducted: integer("system_credits_deducted"),
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
  performedBy: true,
  systemCreditsDeducted: true,
  metadata: true,
});

export type InsertClientEmailCreditsHistory = z.infer<typeof insertClientEmailCreditsHistorySchema>;
export type ClientEmailCreditsHistory = typeof clientEmailCreditsHistory.$inferSelect;

export const clientEmailCreditsHistoryRelations = defineRelations(clientEmailCreditsHistory, {
  client: { relationName: "clientEmailCreditsHistory_to_client", fields: [clientEmailCreditsHistory.clientId], references: [clients.id] },
  user: { relationName: "clientEmailCreditsHistory_to_user", fields: [clientEmailCreditsHistory.performedBy], references: [users.id] }
});

// Define system credits relations
export const systemCreditsHistoryRelations = defineRelations(systemCreditsHistory, {
  user: { relationName: "systemCreditsHistory_to_user", fields: [systemCreditsHistory.performedBy], references: [users.id] }
});

// REMOVED: Define audience persona builder relations
export const audiencePersonasRelations = defineRelations(audiencePersonas, {
  demographics: { relationName: "persona_to_demographics", fields: [audiencePersonas.id], references: [personaDemographics.personaId] },
  behaviors: { relationName: "persona_to_behaviors", fields: [audiencePersonas.id], references: [personaBehaviors.personaId] },
  insights: { relationName: "persona_to_insights", fields: [audiencePersonas.id], references: [personaInsights.personaId] },
  segments: { relationName: "persona_to_segments", fields: [audiencePersonas.id], references: [audienceSegments.personaId] },
  client: { relationName: "persona_to_client", fields: [audiencePersonas.clientId], references: [clients.id] }
});

// REMOVED: Persona demographics relations
export const personaDemographicsRelations = defineRelations(personaDemographics, {
  persona: { relationName: "demographics_to_persona", fields: [personaDemographics.personaId], references: [audiencePersonas.id] }
});

// REMOVED: Persona behaviors relations
export const personaBehaviorsRelations = defineRelations(personaBehaviors, {
  persona: { relationName: "behaviors_to_persona", fields: [personaBehaviors.personaId], references: [audiencePersonas.id] }
});

// REMOVED: Persona insights relations
export const personaInsightsRelations = defineRelations(personaInsights, {
  persona: { relationName: "insights_to_persona", fields: [personaInsights.personaId], references: [audiencePersonas.id] }
});

// REMOVED: Audience segments relations
export const audienceSegmentsRelations = defineRelations(audienceSegments, {
  persona: { relationName: "segment_to_persona", fields: [audienceSegments.personaId], references: [audiencePersonas.id] },
  client: { relationName: "segment_to_client", fields: [audienceSegments.clientId], references: [clients.id] }
});

export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("info"),
  description: text("description").notNull(),
  source: text("source"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});
