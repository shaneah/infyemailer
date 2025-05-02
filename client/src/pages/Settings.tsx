import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import APIHealthOverview from "@/components/APIHealthOverview";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Camera, Upload, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageUsed = 65; // Percentage of storage used
  
  // Set active tab based on path (profile or settings)
  useEffect(() => {
    if (location === "/profile") {
      setActiveTab("account");
    }
  }, [location]);
  
  // Initialize avatar URL when user data loads
  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Preview the image
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the image to server
    handleAvatarUpload(file);
  };
  
  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // In a real implementation, you would send the file to the server
      // const response = await apiRequest('POST', '/api/user/avatar', formData);
      
      // Simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      // Update user data in cache
      if (user) {
        const updatedUser = { ...user, avatarUrl: avatarUrl };
        queryClient.setQueryData(['/api/user'], updatedUser);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your avatar.",
        variant: "destructive"
      });
      // Reset to previous avatar
      setAvatarUrl(user?.avatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    // In a real implementation, you would send a request to remove the avatar
    toast({
      title: "Avatar removed",
      description: "Your profile picture has been removed.",
    });
  };
  
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex flex-col items-end">
          <div className="w-48 bg-gray-200 rounded-full h-2.5 mb-1 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${storageUsed}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-500">{storageUsed}% of 10GB used</span>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full lg:w-auto">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="team">Team Members</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b">
                      <div className="relative group">
                        {avatarUrl ? (
                          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                            <img 
                              src={avatarUrl} 
                              alt="Profile avatar" 
                              className="w-full h-full object-cover"
                            />
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={handleAvatarClick}
                            >
                              <Camera className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-28 h-28 rounded-full bg-gradient-to-r from-[#1a3a5f] to-[#d4af37] flex items-center justify-center text-white text-2xl font-bold cursor-pointer shadow-lg"
                            onClick={handleAvatarClick}
                          >
                            {user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'A'}
                            {user?.lastName?.[0]?.toUpperCase() || 'M'}
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-3">Upload a profile picture to personalize your account.</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                          >
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </Button>
                          
                          {avatarUrl && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-1 text-red-500 hover:text-red-600"
                              onClick={handleRemoveAvatar}
                              disabled={isUploading}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          )}
                          
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* User Information Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          defaultValue={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User' : 'Admin User'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          defaultValue={user?.email || 'admin@infymailer.com'} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          defaultValue={user?.username || 'admin'} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input 
                          id="role" 
                          defaultValue={user?.role || 'Administrator'} 
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="utc-7">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc-12">UTC-12:00</SelectItem>
                          <SelectItem value="utc-11">UTC-11:00</SelectItem>
                          <SelectItem value="utc-10">UTC-10:00</SelectItem>
                          <SelectItem value="utc-9">UTC-09:00</SelectItem>
                          <SelectItem value="utc-8">UTC-08:00</SelectItem>
                          <SelectItem value="utc-7">UTC-07:00 (PDT)</SelectItem>
                          <SelectItem value="utc-6">UTC-06:00 (CST)</SelectItem>
                          <SelectItem value="utc-5">UTC-05:00 (EST)</SelectItem>
                          <SelectItem value="utc-4">UTC-04:00</SelectItem>
                          <SelectItem value="utc-3">UTC-03:00</SelectItem>
                          <SelectItem value="utc-2">UTC-02:00</SelectItem>
                          <SelectItem value="utc-1">UTC-01:00</SelectItem>
                          <SelectItem value="utc">UTC+00:00</SelectItem>
                          <SelectItem value="utc+1">UTC+01:00</SelectItem>
                          <SelectItem value="utc+2">UTC+02:00</SelectItem>
                          <SelectItem value="utc+3">UTC+03:00</SelectItem>
                          <SelectItem value="utc+4">UTC+04:00</SelectItem>
                          <SelectItem value="utc+5">UTC+05:00</SelectItem>
                          <SelectItem value="utc+6">UTC+06:00</SelectItem>
                          <SelectItem value="utc+7">UTC+07:00</SelectItem>
                          <SelectItem value="utc+8">UTC+08:00</SelectItem>
                          <SelectItem value="utc+9">UTC+09:00</SelectItem>
                          <SelectItem value="utc+10">UTC+10:00</SelectItem>
                          <SelectItem value="utc+11">UTC+11:00</SelectItem>
                          <SelectItem value="utc+12">UTC+12:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="marketing" defaultChecked={true} />
                      <Label htmlFor="marketing">Receive marketing emails</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notifications" defaultChecked={true} />
                      <Label htmlFor="notifications">Receive campaign report notifications</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input id="current_password" type="password" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input id="new_password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input id="confirm_password" type="password" />
                      </div>
                    </div>
                    <div className="pt-2 flex items-center space-x-2">
                      <Switch id="two_factor" />
                      <div>
                        <Label htmlFor="two_factor">Two-factor authentication</Label>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Team Members Settings */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        Manage access and permissions for your team
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      Invite Team Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full bg-blue-100 p-2 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">JS</span>
                          </div>
                          <div>
                            <p className="font-medium">John Smith</p>
                            <p className="text-sm text-gray-500">john@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-600 border-none">Owner</Badge>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                      </div>

                      <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">JD</span>
                          </div>
                          <div>
                            <p className="font-medium">Jane Doe</p>
                            <p className="text-sm text-gray-500">jane@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-100 text-purple-600 border-none">Admin</Badge>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">RJ</span>
                          </div>
                          <div>
                            <p className="font-medium">Robert Johnson</p>
                            <p className="text-sm text-gray-500">robert@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-600 border-none">Editor</Badge>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Role Permissions</h3>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Owner</p>
                            <p className="text-sm text-gray-500">Full access to all settings and billing</p>
                          </div>
                          <Button variant="outline" size="sm">Edit Permissions</Button>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Admin</p>
                            <p className="text-sm text-gray-500">Access to all features except billing</p>
                          </div>
                          <Button variant="outline" size="sm">Edit Permissions</Button>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Editor</p>
                            <p className="text-sm text-gray-500">Can create and edit campaigns, but cannot access settings</p>
                          </div>
                          <Button variant="outline" size="sm">Edit Permissions</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Service Status</CardTitle>
                    <CardDescription>Monitor the health and status of connected services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <APIHealthOverview />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}