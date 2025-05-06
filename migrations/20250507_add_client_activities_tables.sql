-- Create client_activities table
CREATE TABLE IF NOT EXISTS "client_activities" (
  "id" SERIAL PRIMARY KEY,
  "client_id" INTEGER NOT NULL REFERENCES "clients"("id"),
  "client_user_id" INTEGER REFERENCES "client_users"("id"),
  "action" VARCHAR(100) NOT NULL,
  "action_type" VARCHAR(100) NOT NULL,
  "entity_id" INTEGER,
  "description" TEXT,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB
);

-- Create data_uploads table
CREATE TABLE IF NOT EXISTS "data_uploads" (
  "id" SERIAL PRIMARY KEY,
  "client_id" INTEGER NOT NULL REFERENCES "clients"("id"),
  "client_user_id" INTEGER REFERENCES "client_users"("id"),
  "type" VARCHAR(50) NOT NULL,
  "filename" VARCHAR(255) NOT NULL,
  "original_filename" VARCHAR(255),
  "file_size" INTEGER NOT NULL,
  "mime_type" VARCHAR(100),
  "file_path" TEXT,
  "status" VARCHAR(50) DEFAULT 'pending',
  "processed_records" INTEGER DEFAULT 0,
  "total_records" INTEGER DEFAULT 0,
  "error_count" INTEGER DEFAULT 0,
  "errors" JSONB,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "uploaded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP,
  "metadata" JSONB
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS "idx_client_activities_client_id" ON "client_activities"("client_id");
CREATE INDEX IF NOT EXISTS "idx_client_activities_client_user_id" ON "client_activities"("client_user_id");
CREATE INDEX IF NOT EXISTS "idx_client_activities_action_type" ON "client_activities"("action_type");
CREATE INDEX IF NOT EXISTS "idx_client_activities_created_at" ON "client_activities"("created_at");

CREATE INDEX IF NOT EXISTS "idx_data_uploads_client_id" ON "data_uploads"("client_id");
CREATE INDEX IF NOT EXISTS "idx_data_uploads_client_user_id" ON "data_uploads"("client_user_id");
CREATE INDEX IF NOT EXISTS "idx_data_uploads_type" ON "data_uploads"("type");
CREATE INDEX IF NOT EXISTS "idx_data_uploads_status" ON "data_uploads"("status");
CREATE INDEX IF NOT EXISTS "idx_data_uploads_uploaded_at" ON "data_uploads"("uploaded_at");