import express from "express";
import { storage } from "../storage";
import { z } from "zod";
import { comparePasswords, hashPassword } from "../auth";
import { insertUserSchema, insertRoleSchema, insertPermissionSchema } from "@shared/schema";
import { Json } from "drizzle-orm/pg-core";

const router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await storage.getUsers();
    // Remove sensitive data
    const sanitizedUsers = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });
    res.json(sanitizedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get a single user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password from response
    const { password, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create a new user
router.post("/users", async (req, res) => {
  try {
    // Validate with Zod schema
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid user data", 
        details: validationResult.error.format() 
      });
    }

    // Hash password
    const { password, ...userData } = validationResult.data;
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword
    });

    // Remove password from response
    const { password: _, ...sanitizedUser } = newUser;
    
    // If a role was specified, assign it
    if (req.body.roleId) {
      const roleId = parseInt(req.body.roleId);
      if (!isNaN(roleId)) {
        await storage.assignRoleToUser(newUser.id, roleId);
      }
    }

    res.status(201).json(sanitizedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update a user
router.patch("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle password update separately if included
    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await hashPassword(req.body.password);
    }

    // Update user with new data
    const updatedData = {
      ...req.body,
      ...(hashedPassword && { password: hashedPassword }),
    };

    // Remove roleId if it exists - we handle role assignment separately
    const { roleId, ...userData } = updatedData;

    const updatedUser = await storage.updateUser(userId, userData);

    // Handle role assignment if included
    if (roleId !== undefined) {
      // First remove any existing roles
      await storage.removeUserRoles(userId);
      
      // Then assign new role if provided
      if (roleId !== null && roleId !== '') {
        await storage.assignRoleToUser(userId, parseInt(roleId.toString()));
      }
    }

    // Remove password from response
    const { password, ...sanitizedUser } = updatedUser || {};

    res.json(sanitizedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Update user status (activate/deactivate)
router.patch("/users/:id/status", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate status value
    const { status } = req.body;
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user status
    const updatedUser = await storage.updateUser(userId, { status });
    
    // Remove password from response
    const { password, ...sanitizedUser } = updatedUser || {};

    res.json(sanitizedUser);
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // First remove user roles
    await storage.removeUserRoles(userId);

    // Then delete the user
    const deleted = await storage.deleteUser(userId);
    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete user" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ROLES ENDPOINTS

// Get all roles
router.get("/roles", async (req, res) => {
  try {
    const roles = await storage.getRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

// Get a single role by ID
router.get("/roles/:id", async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: "Invalid role ID" });
    }

    const role = await storage.getRole(roleId);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Failed to fetch role" });
  }
});

// Create a new role
router.post("/roles", async (req, res) => {
  try {
    // Validate with Zod schema
    const validationResult = insertRoleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid role data", 
        details: validationResult.error.format() 
      });
    }

    const newRole = await storage.createRole(validationResult.data);
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Failed to create role" });
  }
});

// Update a role
router.patch("/roles/:id", async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: "Invalid role ID" });
    }

    const role = await storage.getRole(roleId);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const updatedRole = await storage.updateRole(roleId, req.body);
    res.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Delete a role
router.delete("/roles/:id", async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: "Invalid role ID" });
    }

    // Check if role exists
    const role = await storage.getRole(roleId);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // First remove role permissions
    await storage.removeRolePermissions(roleId);

    // Then remove user associations
    await storage.removeRoleFromUsers(roleId);

    // Finally delete the role
    const deleted = await storage.deleteRole(roleId);
    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete role" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Failed to delete role" });
  }
});

// PERMISSIONS ENDPOINTS

// Get all permissions
router.get("/permissions", async (req, res) => {
  try {
    const permissions = await storage.getPermissions();
    res.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

// Create a new permission
router.post("/permissions", async (req, res) => {
  try {
    // Validate with Zod schema
    const validationResult = insertPermissionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid permission data", 
        details: validationResult.error.format() 
      });
    }

    const newPermission = await storage.createPermission(validationResult.data);
    res.status(201).json(newPermission);
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ error: "Failed to create permission" });
  }
});

// USER-ROLE ENDPOINTS

// Get all user-role assignments
router.get("/user-roles", async (req, res) => {
  try {
    const userRoles = await storage.getUserRoles();
    res.json(userRoles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({ error: "Failed to fetch user roles" });
  }
});

// Get roles for a specific user
router.get("/users/:id/roles", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const roles = await storage.getUserRolesByUserId(userId);
    res.json(roles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({ error: "Failed to fetch user roles" });
  }
});

// Assign a role to a user
router.post("/users/:userId/roles/:roleId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const roleId = parseInt(req.params.roleId);
    
    if (isNaN(userId) || isNaN(roleId)) {
      return res.status(400).json({ error: "Invalid user or role ID" });
    }

    // Check if user and role exist
    const user = await storage.getUser(userId);
    const role = await storage.getRole(roleId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Assign role to user
    const userRole = await storage.assignRoleToUser(userId, roleId);
    res.status(201).json(userRole);
  } catch (error) {
    console.error("Error assigning role to user:", error);
    res.status(500).json({ error: "Failed to assign role to user" });
  }
});

// Remove a role from a user
router.delete("/users/:userId/roles/:roleId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const roleId = parseInt(req.params.roleId);
    
    if (isNaN(userId) || isNaN(roleId)) {
      return res.status(400).json({ error: "Invalid user or role ID" });
    }

    // Remove role from user
    const success = await storage.removeRoleFromUser(userId, roleId);
    if (!success) {
      return res.status(404).json({ error: "User-role assignment not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error removing role from user:", error);
    res.status(500).json({ error: "Failed to remove role from user" });
  }
});

// ROLE-PERMISSION ENDPOINTS

// Get all role-permission assignments
router.get("/role-permissions", async (req, res) => {
  try {
    const rolePermissions = await storage.getRolePermissions();
    res.json(rolePermissions);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    res.status(500).json({ error: "Failed to fetch role permissions" });
  }
});

// Get permissions for a specific role
router.get("/roles/:id/permissions", async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: "Invalid role ID" });
    }

    const permissions = await storage.getRolePermissionsByRoleId(roleId);
    res.json(permissions);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    res.status(500).json({ error: "Failed to fetch role permissions" });
  }
});

// Assign a permission to a role
router.post("/roles/:roleId/permissions/:permissionId", async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const permissionId = parseInt(req.params.permissionId);
    
    if (isNaN(roleId) || isNaN(permissionId)) {
      return res.status(400).json({ error: "Invalid role or permission ID" });
    }

    // Check if role and permission exist
    const role = await storage.getRole(roleId);
    const permission = await storage.getPermission(permissionId);
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Assign permission to role
    const rolePermission = await storage.assignPermissionToRole(roleId, permissionId);
    res.status(201).json(rolePermission);
  } catch (error) {
    console.error("Error assigning permission to role:", error);
    res.status(500).json({ error: "Failed to assign permission to role" });
  }
});

// Remove a permission from a role
router.delete("/roles/:roleId/permissions/:permissionId", async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const permissionId = parseInt(req.params.permissionId);
    
    if (isNaN(roleId) || isNaN(permissionId)) {
      return res.status(400).json({ error: "Invalid role or permission ID" });
    }

    // Remove permission from role
    const success = await storage.removePermissionFromRole(roleId, permissionId);
    if (!success) {
      return res.status(404).json({ error: "Role-permission assignment not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error removing permission from role:", error);
    res.status(500).json({ error: "Failed to remove permission from role" });
  }
});

export default router;