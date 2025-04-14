import { storage } from "./storage";

export async function initializeRolesAndPermissions() {
  try {
    console.log("Starting initialization of default roles and permissions...");
    
    // Check if permissions already exist
    const existingPermissions = await storage.getPermissions();
    if (existingPermissions.length > 0) {
      console.log("Permissions already exist, skipping initialization.");
      return;
    }
    
    // Default permissions by category
    const defaultPermissions = [
      // User Management Permissions
      { name: "View Users", category: "User Management", action: "read", description: "Can view system users" },
      { name: "Create Users", category: "User Management", action: "create", description: "Can create new system users" },
      { name: "Edit Users", category: "User Management", action: "update", description: "Can edit existing system users" },
      { name: "Delete Users", category: "User Management", action: "delete", description: "Can delete system users" },
      
      // Role Management Permissions
      { name: "View Roles", category: "Role Management", action: "read", description: "Can view roles" },
      { name: "Create Roles", category: "Role Management", action: "create", description: "Can create new roles" },
      { name: "Edit Roles", category: "Role Management", action: "update", description: "Can edit existing roles" },
      { name: "Delete Roles", category: "Role Management", action: "delete", description: "Can delete roles" },
      { name: "Assign Permissions", category: "Role Management", action: "assign", description: "Can assign permissions to roles" },
      
      // Campaign Management Permissions
      { name: "View Campaigns", category: "Campaign Management", action: "read", description: "Can view email campaigns" },
      { name: "Create Campaigns", category: "Campaign Management", action: "create", description: "Can create new email campaigns" },
      { name: "Edit Campaigns", category: "Campaign Management", action: "update", description: "Can edit existing campaigns" },
      { name: "Delete Campaigns", category: "Campaign Management", action: "delete", description: "Can delete campaigns" },
      { name: "Send Campaigns", category: "Campaign Management", action: "send", description: "Can send email campaigns" },
      
      // Template Management Permissions
      { name: "View Templates", category: "Template Management", action: "read", description: "Can view email templates" },
      { name: "Create Templates", category: "Template Management", action: "create", description: "Can create new email templates" },
      { name: "Edit Templates", category: "Template Management", action: "update", description: "Can edit existing templates" },
      { name: "Delete Templates", category: "Template Management", action: "delete", description: "Can delete templates" },
      
      // Contact Management Permissions
      { name: "View Contacts", category: "Contact Management", action: "read", description: "Can view contacts" },
      { name: "Create Contacts", category: "Contact Management", action: "create", description: "Can create new contacts" },
      { name: "Edit Contacts", category: "Contact Management", action: "update", description: "Can edit existing contacts" },
      { name: "Delete Contacts", category: "Contact Management", action: "delete", description: "Can delete contacts" },
      { name: "Import Contacts", category: "Contact Management", action: "import", description: "Can import contacts from CSV" },
      { name: "Export Contacts", category: "Contact Management", action: "export", description: "Can export contacts to CSV" },
      
      // List Management Permissions
      { name: "View Lists", category: "List Management", action: "read", description: "Can view contact lists" },
      { name: "Create Lists", category: "List Management", action: "create", description: "Can create new contact lists" },
      { name: "Edit Lists", category: "List Management", action: "update", description: "Can edit existing contact lists" },
      { name: "Delete Lists", category: "List Management", action: "delete", description: "Can delete contact lists" },
      { name: "Manage List Contacts", category: "List Management", action: "manage", description: "Can add/remove contacts from lists" },
      
      // Domain Management Permissions
      { name: "View Domains", category: "Domain Management", action: "read", description: "Can view email domains" },
      { name: "Create Domains", category: "Domain Management", action: "create", description: "Can add new domains" },
      { name: "Edit Domains", category: "Domain Management", action: "update", description: "Can edit existing domains" },
      { name: "Delete Domains", category: "Domain Management", action: "delete", description: "Can delete domains" },
      { name: "Verify Domains", category: "Domain Management", action: "verify", description: "Can verify domain ownership" },
      
      // Client Management Permissions
      { name: "View Clients", category: "Client Management", action: "read", description: "Can view clients" },
      { name: "Create Clients", category: "Client Management", action: "create", description: "Can create new clients" },
      { name: "Edit Clients", category: "Client Management", action: "update", description: "Can edit existing clients" },
      { name: "Delete Clients", category: "Client Management", action: "delete", description: "Can delete clients" },
      { name: "Manage Client Credits", category: "Client Management", action: "manage_credits", description: "Can manage client email credits" },
      
      // System Settings Permissions
      { name: "View Settings", category: "System Settings", action: "read", description: "Can view system settings" },
      { name: "Edit Settings", category: "System Settings", action: "update", description: "Can edit system settings" },
      { name: "Manage Providers", category: "System Settings", action: "manage_providers", description: "Can manage email providers" },
      { name: "View System Credits", category: "System Settings", action: "read_credits", description: "Can view system credit balance" },
      { name: "Manage System Credits", category: "System Settings", action: "manage_credits", description: "Can add/remove system credits" },
    ];
    
    // Create all permissions
    console.log("Creating default permissions...");
    for (const permData of defaultPermissions) {
      await storage.createPermission({
        name: permData.name,
        category: permData.category,
        action: permData.action,
        description: permData.description,
      });
    }
    console.log(`Created ${defaultPermissions.length} default permissions.`);
    
    // Default roles
    const defaultRoles = [
      { 
        name: "Administrator", 
        description: "Full system access with all permissions"
      },
      { 
        name: "Email Manager", 
        description: "Can manage campaigns, templates, and view analytics" 
      },
      { 
        name: "Contact Manager", 
        description: "Can manage contacts and lists" 
      },
      { 
        name: "Client Manager", 
        description: "Can manage clients and their credits" 
      },
      { 
        name: "Viewer", 
        description: "Read-only access to most system data" 
      }
    ];
    
    // Create all roles
    console.log("Creating default roles...");
    const createdRoles = [];
    for (const roleData of defaultRoles) {
      const role = await storage.createRole({
        name: roleData.name,
        description: roleData.description,
        isSystem: true
      });
      createdRoles.push(role);
    }
    console.log(`Created ${defaultRoles.length} default roles.`);
    
    // Assign permissions to roles
    console.log("Assigning permissions to roles...");
    
    // Get all created permissions
    const allPermissions = await storage.getPermissions();
    
    // Administrator - gets all permissions
    const adminRole = createdRoles.find(r => r.name === "Administrator");
    if (adminRole) {
      for (const permission of allPermissions) {
        await storage.assignPermissionToRole(adminRole.id, permission.id);
      }
      console.log(`Assigned all permissions to Administrator role.`);
    }
    
    // Email Manager - gets campaign and template permissions
    const emailManagerRole = createdRoles.find(r => r.name === "Email Manager");
    if (emailManagerRole) {
      const emailManagerPermissions = allPermissions.filter(p => 
        p.category === "Campaign Management" || 
        p.category === "Template Management" ||
        p.name === "View Contacts" ||
        p.name === "View Lists"
      );
      
      for (const permission of emailManagerPermissions) {
        await storage.assignPermissionToRole(emailManagerRole.id, permission.id);
      }
      console.log(`Assigned ${emailManagerPermissions.length} permissions to Email Manager role.`);
    }
    
    // Contact Manager - gets contact and list permissions
    const contactManagerRole = createdRoles.find(r => r.name === "Contact Manager");
    if (contactManagerRole) {
      const contactManagerPermissions = allPermissions.filter(p => 
        p.category === "Contact Management" || 
        p.category === "List Management" ||
        p.name === "View Campaigns"
      );
      
      for (const permission of contactManagerPermissions) {
        await storage.assignPermissionToRole(contactManagerRole.id, permission.id);
      }
      console.log(`Assigned ${contactManagerPermissions.length} permissions to Contact Manager role.`);
    }
    
    // Client Manager - gets client management permissions
    const clientManagerRole = createdRoles.find(r => r.name === "Client Manager");
    if (clientManagerRole) {
      const clientManagerPermissions = allPermissions.filter(p => 
        p.category === "Client Management"
      );
      
      for (const permission of clientManagerPermissions) {
        await storage.assignPermissionToRole(clientManagerRole.id, permission.id);
      }
      console.log(`Assigned ${clientManagerPermissions.length} permissions to Client Manager role.`);
    }
    
    // Viewer - gets all view permissions but no create/edit/delete
    const viewerRole = createdRoles.find(r => r.name === "Viewer");
    if (viewerRole) {
      const viewerPermissions = allPermissions.filter(p => 
        p.name.startsWith("View")
      );
      
      for (const permission of viewerPermissions) {
        await storage.assignPermissionToRole(viewerRole.id, permission.id);
      }
      console.log(`Assigned ${viewerPermissions.length} permissions to Viewer role.`);
    }
    
    // Assign admin role to existing users
    const users = await storage.getUsers();
    for (const user of users) {
      if (adminRole) {
        await storage.assignRoleToUser(user.id, adminRole.id);
        console.log(`Assigned Administrator role to user ${user.username}`);
      }
    }
    
    console.log("Roles and permissions initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing roles and permissions:", error);
  }
}