import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// UI Components
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, MoreHorizontal, Plus, UserPlus, Users, User, MailIcon, 
  CalendarIcon, ShieldCheck, ShieldAlert, LockIcon, UnlockIcon, 
  UserCog, UserMinus, Shield, Search, SlidersHorizontal, LayoutGrid,
  LayoutList, Trash2, FileLock2, PencilIcon, CheckIcon, XIcon,
  AlertTriangle, Info, ChevronRight, UserCheck, Calendar, RefreshCw
} from "lucide-react";

// Types
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

// Stat Card Component
const StatCard = ({ title, value, icon, description, color }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  description: string;
  color: string;
}) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// User Role Badge Component
const RoleBadge = ({ roleName }: { roleName: string }) => {
  const getBadgeStyles = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Email Manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Contact Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Client Manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`font-medium ${getBadgeStyles(roleName)}`}>
      {roleName}
    </Badge>
  );
};

// User Card Component
const UserCard = ({ 
  user, 
  role, 
  onRoleChange, 
  onEdit, 
  onManage
}: { 
  user: User; 
  role: string; 
  onRoleChange: (userId: number, roleId: number) => void;
  onEdit: () => void;
  onManage: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col items-center text-center mb-4">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg">
                {user.firstName && user.lastName 
                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                  : user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold mt-2">{user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.username}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2">
              <RoleBadge roleName={role} />
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>{user.username}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="capitalize">{user.status}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2 pb-4 bg-gray-50">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-700">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onManage}>
                <UserCog className="mr-2 h-4 w-4" />
                Manage User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Role Card Component
const RoleCard = ({ 
  role, 
  isSelected, 
  onClick,
  permissionCount
}: { 
  role: Role; 
  isSelected: boolean;
  onClick: () => void;
  permissionCount: number;
}) => {
  return (
    <div 
      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer 
        ${isSelected 
          ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
        }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{role.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {role.description || "No description provided."}
          </p>
        </div>
        <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
          {permissionCount} permissions
        </Badge>
      </div>
      
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-indigo-200">
          <div className="flex items-center justify-between text-xs text-indigo-700">
            <span>Selected</span>
            <CheckIcon className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
};

// Permission Item Component
const PermissionItem = ({ 
  permission, 
  isAssigned, 
  onToggle,
  disabled
}: { 
  permission: Permission; 
  isAssigned: boolean;
  onToggle: () => void;
  disabled: boolean;
}) => {
  return (
    <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-md">
      <div className="flex items-center">
        <Checkbox 
          id={`permission-${permission.id}`}
          checked={isAssigned}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="mr-3 h-4 w-4 rounded-sm"
        />
        <div>
          <Label 
            htmlFor={`permission-${permission.id}`}
            className="font-medium cursor-pointer"
          >
            {permission.name}
          </Label>
          <p className="text-xs text-gray-500 mt-0.5">
            {permission.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

// Permission Category Component
const PermissionCategory = ({ 
  category, 
  permissions, 
  rolePermissions,
  onToggle,
  isSystemRole
}: { 
  category: string; 
  permissions: Permission[];
  rolePermissions: RolePermission[];
  onToggle: (permissionId: number, isAssigned: boolean) => void;
  isSystemRole: boolean;
}) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="mb-4 last:mb-0">
      <div 
        className="flex items-center justify-between cursor-pointer py-2 px-4 bg-gray-50 rounded-md hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2 text-indigo-600" />
          <h3 className="font-medium">{category}</h3>
        </div>
        <ChevronRight className={`h-4 w-4 transform transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 ml-4 border-l-2 border-gray-200 pl-2"
          >
            {permissions.map(permission => {
              const isAssigned = rolePermissions.some(rp => rp.permissionId === permission.id);
              return (
                <PermissionItem 
                  key={permission.id}
                  permission={permission}
                  isAssigned={isAssigned}
                  onToggle={() => onToggle(permission.id, isAssigned)}
                  disabled={isSystemRole}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper functions
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// User Management Component
const UserManagementV2 = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isManageUserDialogOpen, setIsManageUserDialogOpen] = useState(false);
  
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

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const { userData, roleId } = data;
      
      // Create user
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
      
      // Assign role if provided
      if (roleId) {
        const roleResponse = await fetch(`/api/users/${newUser.id}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId: parseInt(roleId.toString()) })
        });
        
        if (!roleResponse.ok) {
          throw new Error(`User created but failed to assign role: ${roleResponse.statusText}`);
        }
      }
      
      return newUser;
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new user has been added to the system.",
      });
      setIsNewUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
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

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role created successfully",
        description: "The new role has been added to the system.",
      });
      setIsNewRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating role",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // User role change mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId, existingUserRole }: { userId: number, roleId: number, existingUserRole?: UserRole }) => {
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
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle permission mutation
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId, currentlyAssigned }: { roleId: number, permissionId: number, currentlyAssigned: boolean }) => {
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
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.currentlyAssigned ? "Permission removed" : "Permission added",
        description: `Permission has been ${variables.currentlyAssigned ? "removed from" : "added to"} the role.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/role-permissions"] });
    },
    onError: (error: Error, variables) => {
      toast({
        title: `Error ${variables.currentlyAssigned ? "removing" : "adding"} permission`,
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Helper functions
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

  const getRolePermissionsCount = (roleId: number) => {
    return rolePermissions.filter(rp => rp.roleId === roleId).length;
  };

  const getRolePermissions = (roleId: number) => {
    const rolePerms = rolePermissions.filter(rp => rp.roleId === roleId);
    return rolePerms.map(rp => {
      const permission = permissions.find(p => p.id === rp.permissionId);
      return permission;
    }).filter(Boolean) as Permission[];
  };

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
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

    createUserMutation.mutate({ userData, roleId });
  };

  const handleCreateRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      isSystem: false
    };

    createRoleMutation.mutate(roleData);
  };

  const handleUserRoleChange = (userId: number, roleId: number) => {
    const existingUserRole = userRoles.find(ur => ur.userId === userId);
    updateUserRoleMutation.mutate({ userId, roleId, existingUserRole });
  };

  const handleTogglePermission = (roleId: number, permissionId: number, currentlyAssigned: boolean) => {
    togglePermissionMutation.mutate({ roleId, permissionId, currentlyAssigned });
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.statusText}`);
      }

      toast({
        title: "Status updated",
        description: `User status has been updated to ${newStatus}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error updating status",
        description: (error as Error).message || "There was an error updating the user status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error deleting user",
        description: (error as Error).message || "There was an error deleting the user.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return user.username.toLowerCase().includes(searchLower) ||
           user.email.toLowerCase().includes(searchLower) ||
           fullName.includes(searchLower);
  });

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Calculate stats
  const activeUsers = users.filter(user => user.status === 'active').length;
  const totalUsers = users.length;
  const totalRoles = roles.length;
  const totalPermissions = permissions.length;

  // Add debug logging
  const handleEditUser = (user: User) => {
    console.log('handleEditUser called with user:', user);
    try {
      setSelectedUser(user);
      console.log('Selected user set to:', user);
      setIsEditUserDialogOpen(true);
      console.log('Edit dialog opened');
    } catch (error) {
      console.error('Error in handleEditUser:', error);
      toast({
        title: "Error",
        description: "Failed to open edit dialog",
        variant: "destructive",
      });
    }
  };

  // Add manage user function
  const handleManageUser = (user: User) => {
    console.log('handleManageUser called with user:', user);
    try {
      setSelectedUser(user);
      console.log('Selected user for management:', user);
      setIsManageUserDialogOpen(true);
      console.log('Manage dialog opened');
    } catch (error) {
      console.error('Error in handleManageUser:', error);
      toast({
        title: "Error",
        description: "Failed to open manage dialog",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-indigo-800 font-medium">Loading user management data...</p>
        </div>
      </div>
    );
  }

  const error = usersError || rolesError || permissionsError || userRolesError || rolePermissionsError;
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg border border-red-200">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle className="h-8 w-8" />
          <h2 className="text-xl font-semibold">Error loading data</h2>
        </div>
        <p className="mb-6 text-gray-600">{(error as Error).message || "An unknown error occurred while fetching user management data."}</p>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/user-roles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/role-permissions"] });
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 pb-10">
      {/* Header with Gradient */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 md:p-8">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">User Management</h1>
            <p className="text-white/90 max-w-3xl text-sm md:text-base">
              Manage system users, roles, and permissions. Control access to features and functionality.
            </p>
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAxMmM2LjA3OCAwIDExLTQuOTIyIDExLTExcy00LjkyMi0xMS0xMS0xMS0xMSA0LjkyMi0xMSAxMSA0LjkyMiAxMSAxMSAxMXoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10 mix-blend-overlay" />
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          icon={<Users className="h-5 w-5 text-indigo-600" />} 
          description="All registered system users" 
          color="bg-indigo-100"
        />
        <StatCard 
          title="Active Users" 
          value={activeUsers} 
          icon={<UserCheck className="h-5 w-5 text-green-600" />} 
          description={`${Math.round((activeUsers / totalUsers) * 100)}% active rate`} 
          color="bg-green-100"
        />
        <StatCard 
          title="Roles" 
          value={totalRoles} 
          icon={<ShieldCheck className="h-5 w-5 text-purple-600" />} 
          description="Access control roles" 
          color="bg-purple-100"
        />
        <StatCard 
          title="Permissions" 
          value={totalPermissions} 
          icon={<LockIcon className="h-5 w-5 text-blue-600" />} 
          description="Granular permission settings" 
          color="bg-blue-100"
        />
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="bg-white border">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              <Shield className="mr-2 h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Users Tab Content */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and role assignments
                  </CardDescription>
                </div>
                
                <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
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
                        <Button type="button" variant="outline" onClick={() => setIsNewUserDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          {createUserMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 animate-spin" /> 
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" /> 
                              Create User
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 self-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-gray-100" : ""}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-gray-100" : ""}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 md:p-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {filteredUsers.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                      <Users className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                      <p className="text-gray-500">
                        {searchQuery 
                          ? "No users match your search criteria" 
                          : "No users have been created yet"}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <UserCard 
                        key={user.id}
                        user={user}
                        role={getUserRole(user.id)}
                        onRoleChange={(userId, roleId) => handleUserRoleChange(userId, roleId)}
                        onEdit={() => handleEditUser(user)}
                        onManage={() => handleManageUser(user)}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
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
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <Users className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-900">No users found</p>
                              <p className="text-sm text-gray-500">
                                {searchQuery 
                                  ? "No users match your search criteria" 
                                  : "No users have been created yet"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50">
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
                                variant="outline"
                                className={user.status === "active" 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-red-100 text-red-800 border-red-200"
                                }
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Dropdown trigger clicked');
                                    }}
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Manage clicked for user:', user);
                                      handleManageUser(user);
                                    }}
                                  >
                                    <UserCog className="mr-2 h-4 w-4" />
                                    Manage User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Edit clicked for user:', user);
                                      handleEditUser(user);
                                    }}
                                  >
                                    <PencilIcon className="mr-2 h-4 w-4" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className={user.status === "active" ? "text-destructive" : "text-green-600"}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Status toggle clicked for user:', user);
                                      handleToggleUserStatus(user.id, user.status);
                                    }}
                                  >
                                    {user.status === "active" ? (
                                      <>
                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Delete clicked for user:', user);
                                      handleDeleteUser(user.id);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Roles Tab Content */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Roles Management */}
            <Card className="lg:col-span-1 h-min">
              <CardHeader className="border-b p-4">
                <div className="flex justify-between items-center">
                  <CardTitle>Roles</CardTitle>
                  
                  <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="mr-2 h-3 w-3" />
                        Add Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>
                          Create a new role with custom permissions for your users.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateRole}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="roleName">Role Name</Label>
                            <Input id="roleName" name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="roleDescription">Description</Label>
                            <Input id="roleDescription" name="description" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsNewRoleDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={createRoleMutation.isPending}
                          >
                            {createRoleMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Role"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Define roles to assign to users
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {roles.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                      <ShieldAlert className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">No roles defined</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Create your first role to get started.
                      </p>
                      <Button 
                        size="sm" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => setIsNewRoleDialogOpen(true)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Role
                      </Button>
                    </div>
                  ) : (
                    roles.map((role) => (
                      <RoleCard 
                        key={role.id}
                        role={role}
                        isSelected={selectedRole?.id === role.id}
                        onClick={() => setSelectedRole(role)}
                        permissionCount={getRolePermissionsCount(role.id)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions Management */}
            <Card className="lg:col-span-2">
              <CardHeader className="border-b p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <CardTitle>
                      {selectedRole ? `Permissions for ${selectedRole.name}` : "Permissions"}
                    </CardTitle>
                    <CardDescription>
                      {selectedRole 
                        ? "Manage permissions assigned to this role" 
                        : "Select a role to manage its permissions"}
                    </CardDescription>
                  </div>
                  
                  {selectedRole && (
                    <div className="sm:space-y-1 sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                      <p className="text-sm font-medium bg-indigo-50 px-2 py-1 rounded-md sm:bg-transparent sm:px-0 sm:py-0">
                        {getRolePermissionsCount(selectedRole.id)} permissions assigned
                      </p>
                      {selectedRole.name === "Administrator" && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          <Info className="h-3 w-3 mr-1" />
                          System Role
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                {!selectedRole ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    <Shield className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No role selected</h3>
                    <p className="text-gray-500 max-w-sm">
                      Select a role from the list to manage its permissions
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] md:h-[500px] pr-4">
                    <div className="space-y-4">
                      {Object.keys(permissionsByCategory).length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No permissions defined in the system.</p>
                        </div>
                      ) : (
                        Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                          <PermissionCategory 
                            key={category}
                            category={category}
                            permissions={categoryPermissions}
                            rolePermissions={rolePermissions.filter(rp => rp.roleId === selectedRole.id)}
                            onToggle={(permissionId, isAssigned) => 
                              handleTogglePermission(selectedRole.id, permissionId, isAssigned)
                            }
                            isSystemRole={selectedRole.name === "Administrator"}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                console.log('Delete clicked');
                handleDeleteUser(selectedUser.id);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog 
        open={isEditUserDialogOpen} 
        onOpenChange={(open) => {
          console.log('Dialog open state changing to:', open);
          setIsEditUserDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user details below.
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                console.log('Form submitted for user:', selectedUser);
                try {
                  const formData = new FormData(e.currentTarget);
                  const updatedUser = {
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    email: formData.get("email"),
                    username: formData.get("username"),
                  };
                  console.log('Sending update request with data:', updatedUser);

                  const response = await fetch(`/api/users/${selectedUser.id}`, {
                    method: "PATCH",
                    headers: { 
                      "Content-Type": "application/json",
                      "Accept": "application/json"
                    },
                    body: JSON.stringify(updatedUser),
                  });

                  console.log('Response status:', response.status);
                  const responseData = await response.json().catch(() => null);
                  console.log('Response data:', responseData);

                  if (!response.ok) {
                    throw new Error(responseData?.error || `Failed to update user: ${response.statusText}`);
                  }

                  setIsEditUserDialogOpen(false);
                  setSelectedUser(null);
                  queryClient.invalidateQueries({ queryKey: ["/api/users"] });
                  toast({ 
                    title: "User updated",
                    description: "User details have been updated successfully.",
                  });
                } catch (error) {
                  console.error("Error updating user:", error);
                  toast({ 
                    title: "Error updating user",
                    description: (error as Error).message || "There was an error updating the user.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      defaultValue={selectedUser.firstName || ""} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      defaultValue={selectedUser.lastName || ""} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={selectedUser.email} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    defaultValue={selectedUser.username} 
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="border-[#d4af37]/30 text-[#1a3a5f] hover:bg-[#f5f0e1] hover:text-[#1a3a5f] hover:border-[#d4af37]"
                  onClick={() => {
                    console.log('Cancel clicked');
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
                  <span className="bg-gradient-to-r from-white to-[#d4af37]/80 bg-clip-text text-transparent font-medium">Update User</span>
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No user selected for editing.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage User Dialog */}
      <Dialog 
        open={isManageUserDialogOpen} 
        onOpenChange={(open) => {
          console.log('Manage dialog open state changing to:', open);
          setIsManageUserDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              Manage user roles, permissions, and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg">
                      {selectedUser.firstName && selectedUser.lastName 
                        ? `${selectedUser.firstName.charAt(0)}${selectedUser.lastName.charAt(0)}`
                        : selectedUser.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUser.firstName && selectedUser.lastName 
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <Badge 
                      variant={selectedUser.status === "active" ? "default" : "destructive"}
                      className="mt-2"
                    >
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role Management Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Role Management</h4>
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <Select 
                    defaultValue={userRoles.find(ur => ur.userId === selectedUser.id)?.roleId.toString() || ""}
                    onValueChange={(value) => handleUserRoleChange(selectedUser.id, parseInt(value))}
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

              <Separator />

              {/* User Activity Section */}
              <div className="space-y-4">
                <h4 className="font-medium">User Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{formatDate(selectedUser.lastLoginAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No user selected for management.</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Manage dialog closed');
                setIsManageUserDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementV2;