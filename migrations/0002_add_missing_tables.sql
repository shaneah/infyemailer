-- Add missing engagement_metrics table
CREATE TABLE IF NOT EXISTS "engagement_metrics" (
  "id" SERIAL PRIMARY KEY,
  "campaign_id" INTEGER NOT NULL REFERENCES "campaigns"("id"),
  "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "total_opens" INTEGER DEFAULT 0,
  "unique_opens" INTEGER DEFAULT 0,
  "total_clicks" INTEGER DEFAULT 0,
  "unique_clicks" INTEGER DEFAULT 0,
  "click_through_rate" INTEGER DEFAULT 0,
  "average_engagement_time" INTEGER DEFAULT 0,
  "engagement_score" INTEGER DEFAULT 0,
  "most_clicked_link" TEXT,
  "most_active_hour" INTEGER,
  "most_active_device" TEXT,
  "metadata" JSONB
);

-- Add missing link_tracking table
CREATE TABLE IF NOT EXISTS "link_tracking" (
  "id" SERIAL PRIMARY KEY,
  "campaign_id" INTEGER NOT NULL REFERENCES "campaigns"("id"),
  "original_url" TEXT NOT NULL,
  "tracking_url" TEXT NOT NULL,
  "click_count" INTEGER DEFAULT 0,
  "unique_click_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB
);

-- Add missing email_heat_maps table
CREATE TABLE IF NOT EXISTS "email_heat_maps" (
  "id" SERIAL PRIMARY KEY,
  "email_id" INTEGER NOT NULL REFERENCES "emails"("id"),
  "campaign_id" INTEGER NOT NULL REFERENCES "campaigns"("id"),
  "heat_map_data" JSONB NOT NULL DEFAULT '{}',
  "interaction_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing interaction_data_points table if it exists in the schema
CREATE TABLE IF NOT EXISTS "interaction_data_points" (
  "id" SERIAL PRIMARY KEY,
  "campaign_id" INTEGER NOT NULL REFERENCES "campaigns"("id"),
  "email_id" INTEGER REFERENCES "emails"("id"),
  "data_type" TEXT NOT NULL,
  "data_value" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing audience_personas table if it exists in the schema
CREATE TABLE IF NOT EXISTS "audience_personas" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB
);