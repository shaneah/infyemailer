import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MoreHorizontal, Plus, UserPlus, Users } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

type User = {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  role?: string;
  createdAt: string;
  lastLoginAt: string | null;
};

type Role = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
};

type Permission = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
};

type UserRole = {
  id: number;
  userId: number;
  roleId: number;
};

type RolePermission = {
  id: number;
  roleId: number;
  permissionId: number;
};

const UserManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
    retry: 1,
  });

  // Fetch roles
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: rolesError
  } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
    retry: 1,
  });

  // Fetch permissions
  const {
    data: permissions = [],
    isLoading: isLoadingPermissions,
    error: permissionsError
  } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
    retry: 1,
  });

  // Fetch user roles
  const {
    data: userRoles = [],
    isLoading: isLoadingUserRoles,
    error: userRolesError
  } = useQuery<UserRole[]>({
    queryKey: ["/api/user-roles"],
    retry: 1,
  });

  // Fetch role permissions
  const {
    data: rolePermissions = [],
    isLoading: isLoadingRolePermissions,
    error: rolePermissionsError
  } = useQuery<RolePermission[]>({
    queryKey: ["/api/role-permissions"],
    retry: 1,
  });

  const isLoading = isLoadingUsers || isLoadingRoles || isLoadingPermissions || 
                    isLoadingUserRoles || isLoadingRolePermissions;
  
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleId = formData.get("roleId");
    
    const userData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      status: "active"
    };

    try {
      // Make API call to create the user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      
      const newUser = await response.json();
      
      // If a role was selected, assign it to the new user
      if (roleId) {
        const roleResponse = await fetch(`/api/users/${newUser.id}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId: parseInt(roleId.toString()) })
        });
        
        if (!roleResponse.ok) {
          console.warn(`User created but failed to assign role: ${roleResponse.statusText}`);
        }
      }
      
      toast({
        title: "User created",
        description: `User ${userData.username} has been created successfully.`,
      });
      setIsNewUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: (error as Error).message || "There was an error creating the user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      isSystem: false // This matches the schema field (not status)
    };

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create role: ${response.statusText}`);
      }

      const newRole = await response.json();
      toast({
        title: "Role created",
        description: `Role ${roleData.name} has been created successfully.`,
      });
      setIsNewRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error creating role",
        description: (error as Error).message || "There was an error creating the role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserRole = (userId: number) => {
    const userRole = userRoles.find(ur => ur.userId === userId);
    if (!userRole) return "No Role";
    const role = roles.find(r => r.id === userRole.roleId);
    return role ? role.name : "Unknown Role";
  };

  const getRolePermissions = (roleId: number) => {
    const rolePerms = rolePermissions.filter(rp => rp.roleId === roleId);
    return rolePerms.map(rp => {
      const permission = permissions.find(p => p.id === rp.permissionId);
      return permission;
    }).filter(Boolean) as Permission[];
  };

  const handleUserRoleChange = async (userId: number, roleId: number) => {
    try {
      // First check if the user already has a role assigned
      const existingUserRole = userRoles.find(ur => ur.userId === userId);
      
      if (existingUserRole) {
        // Update existing role assignment
        const response = await fetch(`/api/users/${userId}/roles/${existingUserRole.roleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update role: ${response.statusText}`);
        }
      } else {
        // Create new role assignment
        const response = await fetch(`/api/users/${userId}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to assign role: ${response.statusText}`);
        }
      }
      
      toast({
        title: "Role assigned",
        description: `Role has been assigned to the user successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
    } catch (error) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error assigning role",
        description: (error as Error).message || "There was an error assigning the role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePermission = async (roleId: number, permissionId: number, currentlyAssigned: boolean) => {
    try {
      if (currentlyAssigned) {
        // Remove permission from role
        const response = await fetch(`/api/roles/${roleId}/permissions/${permissionId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to remove permission: ${response.statusText}`);
        }
      } else {
        // Add permission to role
        const response = await fetch(`/api/roles/${roleId}/permissions/${permissionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to add permission: ${response.statusText}`);
        }
      }
      
      toast({
        title: currentlyAssigned ? "Permission removed" : "Permission added",
        description: `Permission has been ${currentlyAssigned ? "removed from" : "added to"} the role.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/role-permissions"] });
    } catch (error) {
      console.error(`Error ${currentlyAssigned ? "removing" : "adding"} permission:`, error);
      toast({
        title: `Error ${currentlyAssigned ? "removing" : "adding"} permission`,
        description: (error as Error).message || `There was an error ${currentlyAssigned ? "removing" : "adding"} the permission. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  // Handler to edit a user
  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const formData = new FormData(e.currentTarget);
    const userData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      status: formData.get("status") as string || selectedUser.status,
    };

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
      
      const roleId = formData.get("roleId");
      if (roleId) {
        await handleUserRoleChange(selectedUser.id, parseInt(roleId.toString()));
      }
      
      toast({
        title: "User updated",
        description: `User ${selectedUser.username} has been updated successfully.`,
      });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating user",
        description: (error as Error).message || "There was an error updating the user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler to toggle user status (activate/deactivate)
  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    
    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.statusText}`);
      }
      
      toast({
        title: newStatus === "active" ? "User activated" : "User deactivated",
        description: `User ${user.username} has been ${newStatus === "active" ? "activated" : "deactivated"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error updating user status",
        description: (error as Error).message || "There was an error updating the user status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handler to delete a user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
      
      toast({
        title: "User deleted",
        description: `User ${selectedUser.username} has been deleted successfully.`,
      });
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error deleting user",
        description: (error as Error).message || "There was an error deleting the user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const error = usersError || rolesError || permissionsError || userRolesError || rolePermissionsError;
  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-destructive">Error loading data</h2>
        <p className="mt-2">{(error as Error).message || "An unknown error occurred"}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/role-permissions"] });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="container mx-auto p-6 max-w-7xl bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b border-[#d4af37]/30 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#d4af37] to-[#b8860b] bg-clip-text text-transparent">User Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-[400px] bg-[#1a3a5f] rounded-md border border-[#d4af37]/30">
          <TabsTrigger 
            value="users" 
            className="flex items-center space-x-2 data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#1a3a5f] text-white rounded-sm"
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger 
            value="roles" 
            className="flex items-center space-x-2 data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#1a3a5f] text-white rounded-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1a3a5f]">System Users</h2>
            <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#1a3a5f] to-[#2c5a8f] text-white hover:from-[#1a3a5f]/90 hover:to-[#2c5a8f]/90 hover:shadow-md transition-all duration-300 border border-[#d4af37]/30 hover:border-[#d4af37]">
                  <Plus className="mr-2 h-4 w-4 text-[#d4af37]" />
                  <span className="bg-gradient-to-r from-white to-[#d4af37]/80 bg-clip-text text-transparent font-medium">Add User</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new system user.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <Select name="roleId">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="border-[#d4af37]/30 text-[#1a3a5f] hover:bg-[#f5f0e1] hover:text-[#1a3a5f] hover:border-[#d4af37]"
                      onClick={() => setIsNewUserDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-[#1a3a5f] to-[#2c5a8f] text-white hover:from-[#1a3a5f]/90 hover:to-[#2c5a8f]/90 hover:shadow-md transition-all duration-300 border border-[#d4af37]/30 hover:border-[#d4af37]"
                    >
                      <span className="bg-gradient-to-r from-white to-[#d4af37]/80 bg-clip-text text-transparent font-medium">Create User</span>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border border-[#d4af37]/30 shadow-lg overflow-hidden hover:border-[#d4af37] transition-colors duration-200">
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader className="bg-[#1a3a5f]">
                  <TableRow>
                    <TableHead className="text-white font-semibold">Username</TableHead>
                    <TableHead className="text-white font-semibold">Name</TableHead>
                    <TableHead className="text-white font-semibold">Email</TableHead>
                    <TableHead className="text-white font-semibold">Role</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Created</TableHead>
                    <TableHead className="text-white font-semibold">Last Login</TableHead>
                    <TableHead className="text-white font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No users found. Click 'Add User' to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select 
                            defaultValue={userRoles.find(ur => ur.userId === user.id)?.roleId.toString() || ""}
                            onValueChange={(value) => handleUserRoleChange(user.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Assign Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === "active" ? "default" : "destructive"}
                            className={user.status === "active" ? "bg-green-600" : ""}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user);
                                setIsEditUserDialogOpen(true);
                              }}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(user)}
                                className={user.status === "active" ? "text-destructive" : "text-green-600"}
                              >
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteConfirmOpen(true);
                                }}
                                className="text-destructive"
                              >
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Roles & Permissions</h2>
            <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#1a3a5f] to-[#2c5a8f] text-white hover:from-[#1a3a5f]/90 hover:to-[#2c5a8f]/90 hover:shadow-md transition-all duration-300 border border-[#d4af37]/30 hover:border-[#d4af37]">
                  <Plus className="mr-2 h-4 w-4 text-[#d4af37]" />
                  <span className="bg-gradient-to-r from-white to-[#d4af37]/80 bg-clip-text text-transparent font-medium">Add Role</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific access permissions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateRole}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Role Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" name="description" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="border-[#d4af37]/30 text-[#1a3a5f] hover:bg-[#f5f0e1] hover:text-[#1a3a5f] hover:border-[#d4af37]"
                      onClick={() => setIsNewRoleDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-[#1a3a5f] to-[#2c5a8f] text-white hover:from-[#1a3a5f]/90 hover:to-[#2c5a8f]/90 hover:shadow-md transition-all duration-300 border border-[#d4af37]/30 hover:border-[#d4af37]"
                    >
                      <span className="bg-gradient-to-r from-white to-[#d4af37]/80 bg-clip-text text-transparent font-medium">Create Role</span>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Roles List */}
            <Card className="md:col-span-1 border border-[#d4af37]/30 shadow-lg overflow-hidden hover:border-[#d4af37] transition-colors duration-200">
              <CardHeader className="bg-[#1a3a5f] text-white pb-4">
                <CardTitle className="text-white font-semibold">Available Roles</CardTitle>
                <CardDescription className="text-gray-300">Select a role to manage its permissions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#d4af37]/20">
                  {roles.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No roles defined. Click 'Add Role' to create one.
                    </div>
                  ) : (
                    roles.map((role) => (
                      <div 
                        key={role.id} 
                        className={`p-4 cursor-pointer transition-all duration-200 hover:bg-[#f5f0e1] 
                          ${selectedRole?.id === role.id 
                            ? 'bg-[#f5f0e1] border-l-4 border-[#d4af37] shadow-sm' 
                            : 'border-l-4 border-transparent'
                          }`}
                        onClick={() => setSelectedRole(role)}
                      >
                        <h3 className={`font-medium ${selectedRole?.id === role.id 
                          ? 'text-[#1a3a5f] font-semibold' 
                          : 'text-[#1a3a5f]'}`}>
                          {role.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.description || "No description provided."}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions Management */}
            <Card className="md:col-span-2 border border-[#d4af37]/30 shadow-lg overflow-hidden hover:border-[#d4af37] transition-colors duration-200">
              <CardHeader className="border-b border-[#d4af37]/20">
                <CardTitle className="text-[#1a3a5f] font-semibold">
                  {selectedRole ? `Permissions for ${selectedRole.name}` : "Permissions"}
                </CardTitle>
                <CardDescription>
                  {selectedRole 
                    ? "Manage permissions assigned to this role" 
                    : "Select a role to manage its permissions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedRole ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Select a role from the list to manage its permissions
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.keys(permissionsByCategory).length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No permissions defined in the system.
                      </div>
                    ) : (
                      Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                        <div key={category} className="space-y-3">
                          <h3 className="font-semibold bg-gradient-to-r from-[#1a3a5f] to-[#2c5a8f] text-transparent bg-clip-text text-md border-b border-[#d4af37]/30 pb-2 mb-3 flex items-center">
                            <span className="mr-2 text-[#d4af37]">•</span>
                            <span>{category} Permissions</span>
                          </h3>
                          <div className="grid grid-cols-1 gap-y-2">
                            {categoryPermissions.map((permission) => {
                              const isAssigned = rolePermissions.some(
                                rp => rp.roleId === selectedRole.id && rp.permissionId === permission.id
                              );
                              return (
                                <div 
                                  key={permission.id} 
                                  className={`flex items-start space-x-3 p-3 rounded-md transition-all duration-200 hover:bg-[#f5f0e1] border ${
                                    isAssigned ? 'border-[#d4af37]/50 bg-[#f5f0e1]/50 shadow-sm' : 'border-transparent'
                                  }`}
                                >
                                  <Checkbox 
                                    id={`permission-${permission.id}`} 
                                    checked={isAssigned}
                                    className={isAssigned 
                                      ? "border-[#d4af37] data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-white"
                                      : "border-[#1a3a5f]/30"
                                    }
                                    onCheckedChange={(checked) => {
                                      handleTogglePermission(
                                        selectedRole.id, 
                                        permission.id, 
                                        isAssigned
                                      );
                                    }}
                                  />
                                  <div className="grid gap-1.5 leading-none">
                                    <Label 
                                      htmlFor={`permission-${permission.id}`}
                                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                        isAssigned ? 'text-[#1a3a5f] font-semibold' : ''
                                      }`}
                                    >
                                      {permission.name}
                                    </Label>
                                    {permission.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {permission.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
              {selectedRole && (
                <CardFooter className="border-t px-6 py-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-[#d4af37]/30 text-[#1a3a5f] hover:bg-[#f5f0e1] hover:text-[#1a3a5f] hover:border-[#d4af37]" 
                    onClick={() => setSelectedRole(null)}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input 
                      id="editFirstName" 
                      name="firstName" 
                      defaultValue={selectedUser.firstName || ''} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input 
                      id="editLastName" 
                      name="lastName" 
                      defaultValue={selectedUser.lastName || ''} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input 
                    id="editEmail" 
                    name="email" 
                    type="email" 
                    defaultValue={selectedUser.email} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUsername">Username</Label>
                  <Input 
                    id="editUsername" 
                    name="username" 
                    defaultValue={selectedUser.username} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">Username cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select name="status" defaultValue={selectedUser.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role</Label>
                  <Select 
                    name="roleId"
                    defaultValue={
                      userRoles.find(ur => ur.userId === selectedUser.id)?.roleId.toString()
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="border-[#d4af37]/30 text-[#1a3a5f] hover:bg-[#f5f0e1] hover:text-[#1a3a5f] hover:border-[#d4af37]"
                  onClick={() => {
                    setIsEditUserDialogOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#1a3a5f] to-[#2c5a8f] text-white hover:from-[#1a3a5f]/90 hover:to-[#2c5a8f]/90 hover:shadow-md transition-all duration-300 border border-[#d4af37]/30 hover:border-[#d4af37]"
                >
                  <span className="bg-gradient-to-r from-white to-[#d4af37]/80 bg-clip-text text-transparent font-medium">Save Changes</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="space-y-2 text-center">
                <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-sm text-muted-foreground">Username: {selectedUser.username}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="border-[#d4af37]/30 text-[#1a3a5f] hover:bg-[#f5f0e1] hover:text-[#1a3a5f] hover:border-[#d4af37]"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;