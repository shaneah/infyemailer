import { db, initDatabase } from "../server/db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

async function clearSampleData() {
  console.log("🧹 Starting sample data cleanup process...");
  
  try {
    // Initialize database connection
    const dbInitialized = await initDatabase();
    if (!dbInitialized) {
      console.error("❌ Failed to initialize database connection");
      process.exit(1);
    }
    
    console.log("✅ Database connection established");

    // Delete in proper order to respect foreign key constraints
    
    // 1. First attempt to clear campaign domain relationships
    try {
      const campaignDomainResult = await db.delete(schema.campaignDomains).returning();
      console.log(`🗑️ Removed ${campaignDomainResult.length} campaign domain relationships`);
    } catch (error) {
      console.log(`⚠️ No campaign domains to remove or error: ${error.message}`);
    }

    // 2. Attempt to clear variant analytics
    try {
      // Using raw SQL for tables that might not be in the schema but exist in the database
      await db.execute(sql`DELETE FROM variant_analytics`);
      console.log(`🗑️ Removed variant analytics`);
    } catch (error) {
      console.log(`⚠️ No variant analytics to remove or error: ${error.message}`);
    }
  
    // 3. Attempt to clear campaign variants
    try {
      await db.execute(sql`DELETE FROM campaign_variants`);
      console.log(`🗑️ Removed campaign variants`);
    } catch (error) {
      console.log(`⚠️ No campaign variants to remove or error: ${error.message}`);
    }
    
    // 4. Delete emails
    try {
      const emailResult = await db.delete(schema.emails).returning();
      console.log(`🗑️ Removed ${emailResult.length} emails`);
    } catch (error) {
      console.log(`⚠️ No emails to remove or error: ${error.message}`);
    }

    // 5. Delete campaigns
    try {
      const campaignResult = await db.delete(schema.campaigns).returning();
      console.log(`🗑️ Removed ${campaignResult.length} campaigns`);
    } catch (error) {
      console.log(`⚠️ No campaigns to remove or error: ${error.message}`);
    }

    // 6. Delete contact-list relationships
    try {
      const contactListResult = await db.delete(schema.contactLists).returning();
      console.log(`🗑️ Removed ${contactListResult.length} contact-list relationships`);
    } catch (error) {
      console.log(`⚠️ No contact lists to remove or error: ${error.message}`);
    }

    // 7. Delete contacts
    try {
      const contactResult = await db.delete(schema.contacts).returning();
      console.log(`🗑️ Removed ${contactResult.length} contacts`);
    } catch (error) {
      console.log(`⚠️ No contacts to remove or error: ${error.message}`);
    }

    // 8. Delete lists
    try {
      const listResult = await db.delete(schema.lists).returning();
      console.log(`🗑️ Removed ${listResult.length} lists`);
    } catch (error) {
      console.log(`⚠️ No lists to remove or error: ${error.message}`);
    }

    // 9. Delete templates
    try {
      const templateResult = await db.delete(schema.templates).returning();
      console.log(`🗑️ Removed ${templateResult.length} templates`);
    } catch (error) {
      console.log(`⚠️ No templates to remove or error: ${error.message}`);
    }

    // Keep clients, users, domains, and settings as these are configuration rather than sample data
    
    console.log("✅ Sample data cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during sample data cleanup:", error);
    process.exit(1);
  }

  process.exit(0);
}

clearSampleData();