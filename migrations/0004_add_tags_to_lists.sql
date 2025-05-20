-- Add tags column as TEXT[] (array of text) with default empty array
ALTER TABLE "lists"
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update any existing rows to have an empty array if tags is NULL
UPDATE "lists" 
SET "tags" = ARRAY[]::TEXT[]
WHERE "tags" IS NULL;
