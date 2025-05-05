import { db } from '../db';

async function migrationAddSubjectToTemplates() {
  console.log("Running migration: Add subject field to templates table");
  
  try {
    // Check if the subject column exists already
    const result = await db.execute(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'templates' 
       AND column_name = 'subject'`
    );

    // If column doesn't exist, add it
    if (result.rows.length === 0) {
      console.log("Adding 'subject' column to templates table");
      await db.execute(`ALTER TABLE templates ADD COLUMN subject TEXT`);
      
      // Update existing templates to use name as subject if subject is null
      console.log("Updating existing templates with default subject values");
      await db.execute(`UPDATE templates SET subject = name WHERE subject IS NULL`);
      
      console.log("Migration completed successfully");
    } else {
      console.log("'subject' column already exists in templates table");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Execute the migration
migrationAddSubjectToTemplates()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });