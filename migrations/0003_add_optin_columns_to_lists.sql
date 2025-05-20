-- Add require_double_opt_in column to lists table
ALTER TABLE "lists" 
ADD COLUMN IF NOT EXISTS "require_double_opt_in" BOOLEAN NOT NULL DEFAULT false;

-- Add send_welcome_email column to lists table
ALTER TABLE "lists" 
ADD COLUMN IF NOT EXISTS "send_welcome_email" BOOLEAN NOT NULL DEFAULT false;

-- Add tags column as TEXT[] (array of text)
ALTER TABLE "lists"
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing rows to have default values
UPDATE "lists" 
SET 
  "require_double_opt_in" = COALESCE("require_double_opt_in", false),
  "send_welcome_email" = COALESCE("send_welcome_email", false),
  "tags" = COALESCE("tags", ARRAY[]::TEXT[])
WHERE 
  "require_double_opt_in" IS NULL 
  OR "send_welcome_email" IS NULL
  OR "tags" IS NULL;
