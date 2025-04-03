// Create admin user script
import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  console.log("Creating admin user...");

  try {
    // Check if admin already exists
    const [adminUser] = await db.select().from(users).where(eq(users.username, "admin"));

    if (adminUser) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Insert admin user
    const hashedPassword = await hashPassword("admin123"); // In production, use a secure password
    
    const [newUser] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@infymailer.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        status: "active",
        createdAt: new Date(),
        lastLoginAt: null,
        metadata: {
          permissions: ["all"],
          theme: "light"
        }
      })
      .returning();

    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123"); // Don't log passwords in production
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();