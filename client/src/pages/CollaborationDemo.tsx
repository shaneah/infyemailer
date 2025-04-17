import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CollaborationNotifier } from '@/components/CollaborationNotifier';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import './client-portal.css';

const CollaborationDemo = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState('demo-user-1');
  const [userName, setUserName] = useState('Demo User');
  const [userRole, setUserRole] = useState('admin');
  const [resourceId, setResourceId] = useState('campaign-123');
  const [resourceType, setResourceType] = useState('campaign');
  const [notificationTitle, setNotificationTitle] = useState('Hello Team!');
  const [notificationMessage, setNotificationMessage] = useState('Welcome to the collaboration demo!');
  
  // Simulate a user joining the collaboration
  const simulateUserJoin = async () => {
    try {
      const response = await fetch('/api/collaboration/simulate/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
          userRole
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Join simulated",
          description: `Simulated ${userName} joining the collaboration`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error simulating join:', error);
      toast({
        title: "Error",
        description: "Failed to simulate user join",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  // Simulate a user editing a resource
  const simulateResourceEdit = async () => {
    try {
      const response = await fetch('/api/collaboration/simulate/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
          resourceId,
          resourceType
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Edit simulated",
          description: `Simulated ${userName} editing ${resourceType} ${resourceId}`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error simulating edit:', error);
      toast({
        title: "Error",
        description: "Failed to simulate resource edit",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  // Send a custom notification
  const sendCustomNotification = async () => {
    try {
      const response = await fetch('/api/collaboration/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Notification sent",
          description: "Custom notification was sent to all users",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
        duration: 3000
      });
    }
  };
  
  return (
    <div className="client-portal-container client-theme min-h-screen bg-gray-50">
      <div className="client-top-nav">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">InfyMailer - Collaboration Demo</h1>
          </div>
          <div className="flex items-center space-x-2">
            <CollaborationNotifier 
              userId={userId}
              userName={userName}
              userRole={userRole}
              userAvatar=""
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Real-Time Collaboration Demo</h1>
          <p className="text-gray-600 mb-8">
            This page demonstrates the real-time collaboration notification system.
            Use the controls below to simulate collaboration events and see notifications appear.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Set the user identity for this demo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input 
                      id="userId" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userName">User Name</Label>
                    <Input 
                      id="userName" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userRole">User Role</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resource Information</CardTitle>
                <CardDescription>Set the resource details for edit simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resourceId">Resource ID</Label>
                    <Input 
                      id="resourceId" 
                      value={resourceId}
                      onChange={(e) => setResourceId(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resourceType">Resource Type</Label>
                    <Select value={resourceType} onValueChange={setResourceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="campaign">Campaign</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="list">Contact List</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Custom Notification</CardTitle>
              <CardDescription>Send a custom notification to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationTitle">Notification Title</Label>
                  <Input 
                    id="notificationTitle" 
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notificationMessage">Notification Message</Label>
                  <Input 
                    id="notificationMessage" 
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={simulateUserJoin}
              className="client-btn client-btn-primary"
            >
              Simulate User Join
            </Button>
            
            <Button
              size="lg"
              onClick={simulateResourceEdit}
              className="client-btn client-btn-secondary"
            >
              Simulate Resource Edit
            </Button>
            
            <Button
              size="lg"
              onClick={sendCustomNotification}
              variant="outline"
              className="client-btn client-btn-outline"
            >
              Send Custom Notification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDemo;