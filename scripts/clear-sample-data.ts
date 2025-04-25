import { db, initDatabase } from "../server/db";
import * as schema from "../shared/schema";
import { eq, sql } from "drizzle-orm";

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

    // Using raw SQL to disable foreign key constraints temporarily
    try {
      await db.execute(sql`SET session_replication_role = 'replica'`);
      console.log("⚙️ Temporarily disabled foreign key constraints");
    } catch (error) {
      console.log(`⚠️ Failed to disable foreign key constraints: ${error.message}`);
    }

    // Delete data in proper order
    
    // 1. First clear variant analytics (if exists)
    try {
      await db.execute(sql`DELETE FROM variant_analytics`);
      console.log(`🗑️ Removed variant analytics`);
    } catch (error) {
      console.log(`⚠️ No variant analytics to remove or error: ${error.message}`);
    }
  
    // 2. Clear campaign variants (if exists)
    try {
      await db.execute(sql`DELETE FROM campaign_variants`);
      console.log(`🗑️ Removed campaign variants`);
    } catch (error) {
      console.log(`⚠️ No campaign variants to remove or error: ${error.message}`);
    }
    
    // 3. Clear campaign domain relationships
    try {
      const campaignDomainResult = await db.delete(schema.campaignDomains).returning();
      console.log(`🗑️ Removed ${campaignDomainResult.length} campaign domain relationships`);
    } catch (error) {
      console.log(`⚠️ No campaign domains to remove or error: ${error.message}`);
    }

    // 4. Delete campaign analytics (if exists)
    try {
      await db.execute(sql`DELETE FROM campaign_analytics`);
      console.log(`🗑️ Removed campaign analytics`);
    } catch (error) {
      console.log(`⚠️ No campaign analytics to remove or error: ${error.message}`);
    }
    
    // 5. Delete emails
    try {
      const emailResult = await db.delete(schema.emails).returning();
      console.log(`🗑️ Removed ${emailResult.length} emails`);
    } catch (error) {
      console.log(`⚠️ No emails to remove or error: ${error.message}`);
    }

    // 6. Delete campaigns
    try {
      await db.execute(sql`DELETE FROM campaigns`);
      console.log(`🗑️ Removed campaigns`);
    } catch (error) {
      console.log(`⚠️ No campaigns to remove or error: ${error.message}`);
    }

    // 7. Delete contact-list relationships
    try {
      const contactListResult = await db.delete(schema.contactLists).returning();
      console.log(`🗑️ Removed ${contactListResult.length} contact-list relationships`);
    } catch (error) {
      console.log(`⚠️ No contact lists to remove or error: ${error.message}`);
    }

    // 8. Delete contacts
    try {
      const contactResult = await db.delete(schema.contacts).returning();
      console.log(`🗑️ Removed ${contactResult.length} contacts`);
    } catch (error) {
      console.log(`⚠️ No contacts to remove or error: ${error.message}`);
    }

    // 9. Delete lists
    try {
      const listResult = await db.delete(schema.lists).returning();
      console.log(`🗑️ Removed ${listResult.length} lists`);
    } catch (error) {
      console.log(`⚠️ No lists to remove or error: ${error.message}`);
    }

    // 10. Delete templates
    try {
      await db.execute(sql`DELETE FROM templates`);
      console.log(`🗑️ Removed templates`);
    } catch (error) {
      console.log(`⚠️ No templates to remove or error: ${error.message}`);
    }
    
    // Re-enable foreign key constraints
    try {
      await db.execute(sql`SET session_replication_role = 'origin'`);
      console.log("⚙️ Re-enabled foreign key constraints");
    } catch (error) {
      console.log(`⚠️ Failed to re-enable foreign key constraints: ${error.message}`);
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