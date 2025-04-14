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
    const userData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      status: "active"
    };

    try {
      // Placeholder for actual API call - to be implemented
      toast({
        title: "User created",
        description: `User ${userData.username} has been created successfully.`,
      });
      setIsNewUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error) {
      toast({
        title: "Error creating user",
        description: "There was an error creating the user. Please try again.",
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
      status: "active"
    };

    try {
      // Placeholder for actual API call - to be implemented
      toast({
        title: "Role created",
        description: `Role ${roleData.name} has been created successfully.`,
      });
      setIsNewRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    } catch (error) {
      toast({
        title: "Error creating role",
        description: "There was an error creating the role. Please try again.",
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
      // Placeholder for actual API call - to be implemented
      toast({
        title: "Role assigned",
        description: `Role has been assigned to the user successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
    } catch (error) {
      toast({
        title: "Error assigning role",
        description: "There was an error assigning the role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePermission = async (roleId: number, permissionId: number, currentlyAssigned: boolean) => {
    try {
      if (currentlyAssigned) {
        // Remove permission from role
        // Placeholder for actual API call - to be implemented
      } else {
        // Add permission to role
        // Placeholder for actual API call - to be implemented
      }
      toast({
        title: currentlyAssigned ? "Permission removed" : "Permission added",
        description: `Permission has been ${currentlyAssigned ? "removed from" : "added to"} the role.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/role-permissions"] });
    } catch (error) {
      toast({
        title: `Error ${currentlyAssigned ? "removing" : "adding"} permission`,
        description: `There was an error ${currentlyAssigned ? "removing" : "adding"} the permission. Please try again.`,
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
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Users</h2>
            <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-luxury hover:bg-blue-900">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
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
                    <Button variant="outline" type="button" onClick={() => setIsNewUserDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-luxury hover:bg-blue-900">Create User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={user.status === "active" ? "text-destructive" : "text-green-600"}
                              >
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
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
                <Button className="bg-blue-luxury hover:bg-blue-900">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
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
                    <Button variant="outline" type="button" onClick={() => setIsNewRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-luxury hover:bg-blue-900">Create Role</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Roles List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Available Roles</CardTitle>
                <CardDescription>Select a role to manage its permissions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {roles.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No roles defined. Click 'Add Role' to create one.
                    </div>
                  ) : (
                    roles.map((role) => (
                      <div 
                        key={role.id} 
                        className={`p-4 cursor-pointer hover:bg-accent ${selectedRole?.id === role.id ? 'bg-accent' : ''}`}
                        onClick={() => setSelectedRole(role)}
                      >
                        <h3 className="font-medium text-foreground">{role.name}</h3>
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
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
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
                          <h3 className="font-semibold text-blue-luxury text-md border-b pb-2">
                            {category} Permissions
                          </h3>
                          <div className="grid grid-cols-1 gap-y-2">
                            {categoryPermissions.map((permission) => {
                              const isAssigned = rolePermissions.some(
                                rp => rp.roleId === selectedRole.id && rp.permissionId === permission.id
                              );
                              return (
                                <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent">
                                  <Checkbox 
                                    id={`permission-${permission.id}`} 
                                    checked={isAssigned}
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
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {permission.name}
                                    </Label>
                                    {permission.description && (
                                      <p className="text-xs text-muted-foreground">
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
                  <Button variant="outline" className="w-full" onClick={() => setSelectedRole(null)}>
                    Cancel
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;