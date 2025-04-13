-- Create database schema for InfyMailer

-- Users table (admin users)
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(255) NOT NULL UNIQUE,
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255),
  "lastName" VARCHAR(255),
  "role" VARCHAR(50) DEFAULT 'admin',
  "status" VARCHAR(50) DEFAULT 'active',
  "avatarUrl" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "lastLoginAt" TIMESTAMP WITH TIME ZONE
);

-- Clients table
CREATE TABLE IF NOT EXISTS "clients" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "company" VARCHAR(255) NOT NULL,
  "industry" VARCHAR(255),
  "status" VARCHAR(50) DEFAULT 'active',
  "totalSpend" DECIMAL(12, 2),
  "emailCredits" INTEGER DEFAULT 0,
  "emailCreditsPurchased" INTEGER DEFAULT 0,
  "emailCreditsUsed" INTEGER DEFAULT 0,
  "lastCreditUpdateAt" TIMESTAMP WITH TIME ZONE,
  "lastCampaignAt" TIMESTAMP WITH TIME ZONE,
  "avatar" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Client Users table
CREATE TABLE IF NOT EXISTS "client_users" (
  "id" SERIAL PRIMARY KEY,
  "clientId" INTEGER NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "username" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'active',
  "permissions" JSONB DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "lastLoginAt" TIMESTAMP WITH TIME ZONE
);

-- Client Email Credits History
CREATE TABLE IF NOT EXISTS "client_email_credits_history" (
  "id" SERIAL PRIMARY KEY,
  "clientId" INTEGER NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL, -- 'add', 'deduct', 'set'
  "amount" INTEGER NOT NULL,
  "previousBalance" INTEGER NOT NULL,
  "newBalance" INTEGER NOT NULL,
  "reason" TEXT,
  "performedBy" INTEGER REFERENCES "users"("id"),
  "systemCreditsDeducted" INTEGER,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Credits table
CREATE TABLE IF NOT EXISTS "system_credits" (
  "id" SERIAL PRIMARY KEY,
  "totalCredits" INTEGER NOT NULL DEFAULT 0,
  "allocatedCredits" INTEGER NOT NULL DEFAULT 0,
  "availableCredits" INTEGER NOT NULL DEFAULT 0,
  "lastUpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Credits History table
CREATE TABLE IF NOT EXISTS "system_credits_history" (
  "id" SERIAL PRIMARY KEY,
  "type" VARCHAR(50) NOT NULL, -- 'add', 'deduct', 'allocate'
  "amount" INTEGER NOT NULL,
  "previousBalance" INTEGER NOT NULL,
  "newBalance" INTEGER NOT NULL,
  "reason" TEXT,
  "performedBy" INTEGER REFERENCES "users"("id"),
  "clientId" INTEGER REFERENCES "clients"("id"),
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'active',
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact Lists table
CREATE TABLE IF NOT EXISTS "contact_lists" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact List Relations table (many-to-many)
CREATE TABLE IF NOT EXISTS "contact_list_relations" (
  "id" SERIAL PRIMARY KEY,
  "contactId" INTEGER NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
  "listId" INTEGER NOT NULL REFERENCES "contact_lists"("id") ON DELETE CASCADE,
  "addedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("contactId", "listId")
);

-- Templates table
CREATE TABLE IF NOT EXISTS "templates" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "content" TEXT NOT NULL,
  "category" VARCHAR(50) DEFAULT 'standard',
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Domains table
CREATE TABLE IF NOT EXISTS "domains" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "status" VARCHAR(50) DEFAULT 'pending',
  "verified" BOOLEAN DEFAULT false,
  "defaultDomain" BOOLEAN DEFAULT false,
  "dkimVerified" BOOLEAN,
  "spfVerified" BOOLEAN,
  "dmarcVerified" BOOLEAN,
  "dkimSelector" VARCHAR(255),
  "dkimValue" TEXT,
  "spfValue" TEXT,
  "dmarcValue" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP WITH TIME ZONE
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(255),
  "previewText" TEXT,
  "senderName" VARCHAR(255),
  "replyToEmail" VARCHAR(255),
  "content" TEXT,
  "templateId" INTEGER REFERENCES "templates"("id"),
  "listId" INTEGER REFERENCES "contact_lists"("id"),
  "clientId" INTEGER REFERENCES "clients"("id"),
  "status" VARCHAR(50) DEFAULT 'draft',
  "scheduledAt" TIMESTAMP WITH TIME ZONE,
  "sentAt" TIMESTAMP WITH TIME ZONE,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Domain Relations table (many-to-many)
CREATE TABLE IF NOT EXISTS "campaign_domain_relations" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "domainId" INTEGER NOT NULL REFERENCES "domains"("id") ON DELETE CASCADE,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("campaignId", "domainId")
);

-- Emails table (individual emails sent)
CREATE TABLE IF NOT EXISTS "emails" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER REFERENCES "campaigns"("id"),
  "contactId" INTEGER REFERENCES "contacts"("id"),
  "subject" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "to" VARCHAR(255) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pending',
  "sentAt" TIMESTAMP WITH TIME ZONE,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Opens table
CREATE TABLE IF NOT EXISTS "email_opens" (
  "id" SERIAL PRIMARY KEY,
  "emailId" INTEGER REFERENCES "emails"("id"),
  "contactId" INTEGER REFERENCES "contacts"("id"),
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id"),
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" VARCHAR(50),
  "userAgent" TEXT,
  "deviceType" VARCHAR(50),
  "browser" VARCHAR(50),
  "os" VARCHAR(50),
  "country" VARCHAR(50),
  "city" VARCHAR(50),
  "metadata" JSONB DEFAULT '{}'
);

-- Email Clicks table
CREATE TABLE IF NOT EXISTS "email_clicks" (
  "id" SERIAL PRIMARY KEY,
  "emailId" INTEGER REFERENCES "emails"("id"),
  "contactId" INTEGER REFERENCES "contacts"("id"),
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id"),
  "url" VARCHAR(1024) NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" VARCHAR(50),
  "userAgent" TEXT,
  "deviceType" VARCHAR(50),
  "browser" VARCHAR(50),
  "os" VARCHAR(50),
  "country" VARCHAR(50),
  "city" VARCHAR(50),
  "metadata" JSONB DEFAULT '{}'
);

-- Campaign Analytics table
CREATE TABLE IF NOT EXISTS "campaign_analytics" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "opens" INTEGER DEFAULT 0,
  "clicks" INTEGER DEFAULT 0,
  "bounces" INTEGER DEFAULT 0,
  "unsubscribes" INTEGER DEFAULT 0,
  "metadata" JSONB DEFAULT '{}',
  UNIQUE ("campaignId", "date")
);

-- Campaign Performance table (detailed aggregated metrics)
CREATE TABLE IF NOT EXISTS "campaign_performance" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "totalOpens" INTEGER,
  "uniqueOpens" INTEGER,
  "totalClicks" INTEGER,
  "uniqueClicks" INTEGER,
  "clickThroughRate" DECIMAL(5, 2),
  "bounceRate" DECIMAL(5, 2),
  "deliveryRate" DECIMAL(5, 2),
  "unsubscribeRate" DECIMAL(5, 2),
  "mostClickedLink" TEXT,
  "mostActiveDevice" VARCHAR(50),
  "metadata" JSONB DEFAULT '{}',
  UNIQUE ("campaignId", "date")
);

-- Campaign Links table
CREATE TABLE IF NOT EXISTS "campaign_links" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "originalUrl" TEXT NOT NULL,
  "trackingUrl" TEXT NOT NULL,
  "clickCount" INTEGER DEFAULT 0,
  "uniqueClickCount" INTEGER DEFAULT 0,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audience Personas table
CREATE TABLE IF NOT EXISTS "audience_personas" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "clientId" INTEGER REFERENCES "clients"("id"),
  "isDefault" BOOLEAN DEFAULT false,
  "status" VARCHAR(50) DEFAULT 'active',
  "imageUrl" TEXT,
  "traits" JSONB DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Persona Demographics table
CREATE TABLE IF NOT EXISTS "persona_demographics" (
  "id" SERIAL PRIMARY KEY,
  "personaId" INTEGER NOT NULL REFERENCES "audience_personas"("id") ON DELETE CASCADE,
  "ageRange" VARCHAR(50),
  "gender" VARCHAR(50),
  "location" VARCHAR(255),
  "income" VARCHAR(50),
  "education" VARCHAR(100),
  "occupation" VARCHAR(100),
  "maritalStatus" VARCHAR(50),
  "metadata" JSONB DEFAULT '{}'
);

-- Persona Behavior table
CREATE TABLE IF NOT EXISTS "persona_behavior" (
  "id" SERIAL PRIMARY KEY,
  "personaId" INTEGER NOT NULL REFERENCES "audience_personas"("id") ON DELETE CASCADE,
  "purchaseFrequency" VARCHAR(50),
  "browserUsage" VARCHAR(255),
  "devicePreference" VARCHAR(50),
  "emailOpenRate" DECIMAL(5, 2),
  "clickThroughRate" DECIMAL(5, 2),
  "socialMediaUsage" JSONB DEFAULT '{}',
  "interests" JSONB DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}'
);

-- Persona Insights table
CREATE TABLE IF NOT EXISTS "persona_insights" (
  "id" SERIAL PRIMARY KEY,
  "personaId" INTEGER NOT NULL REFERENCES "audience_personas"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "insightType" VARCHAR(50) NOT NULL,
  "score" INTEGER, -- 1-100 indicating confidence or relevance
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Segments table
CREATE TABLE IF NOT EXISTS "segments" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "clientId" INTEGER REFERENCES "clients"("id"),
  "personaId" INTEGER REFERENCES "audience_personas"("id"),
  "rules" JSONB NOT NULL,
  "status" VARCHAR(50) DEFAULT 'active',
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AB Testing Variants table
CREATE TABLE IF NOT EXISTS "ab_variants" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "previewText" TEXT,
  "content" TEXT,
  "weight" INTEGER DEFAULT 50, -- percentage of recipients to receive this variant
  "isWinner" BOOLEAN DEFAULT false,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AB Testing Variant Analytics
CREATE TABLE IF NOT EXISTS "ab_variant_analytics" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
  "variantId" INTEGER NOT NULL REFERENCES "ab_variants"("id") ON DELETE CASCADE,
  "recipients" INTEGER DEFAULT 0,
  "opens" INTEGER DEFAULT 0,
  "clicks" INTEGER DEFAULT 0,
  "bounces" INTEGER DEFAULT 0,
  "unsubscribes" INTEGER DEFAULT 0,
  "metadata" JSONB DEFAULT '{}'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts("email");
CREATE INDEX IF NOT EXISTS idx_contact_list_relations_list ON contact_list_relations("listId");
CREATE INDEX IF NOT EXISTS idx_contact_list_relations_contact ON contact_list_relations("contactId");
CREATE INDEX IF NOT EXISTS idx_campaign_status ON campaigns("status");
CREATE INDEX IF NOT EXISTS idx_emails_campaign ON emails("campaignId");
CREATE INDEX IF NOT EXISTS idx_emails_contact ON emails("contactId");
CREATE INDEX IF NOT EXISTS idx_email_opens_campaign ON email_opens("campaignId");
CREATE INDEX IF NOT EXISTS idx_email_clicks_campaign ON email_clicks("campaignId");
CREATE INDEX IF NOT EXISTS idx_email_clicks_url ON email_clicks("url");
CREATE INDEX IF NOT EXISTS idx_client_users_client ON client_users("clientId");
CREATE INDEX IF NOT EXISTS idx_client_email_credits_history_client ON client_email_credits_history("clientId");
CREATE INDEX IF NOT EXISTS idx_campaign_domain_relations_campaign ON campaign_domain_relations("campaignId");
CREATE INDEX IF NOT EXISTS idx_campaign_domain_relations_domain ON campaign_domain_relations("domainId");