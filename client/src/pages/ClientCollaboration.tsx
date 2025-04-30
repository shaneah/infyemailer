import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Users,
  MessageSquare,
  FileEdit,
  Clock,
  Calendar,
  ListChecks,
  FileText,
  Upload,
  Link as LinkIcon,
  Bell,
  BarChart3,
  ThumbsUp,
  Info,
  Mail,
  Paperclip,
  Send,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  ArrowUpRight,
  RefreshCw,
  Megaphone,
  Building,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Type definitions
interface Client {
  id: number;
  name: string;
  company: string;
  avatar?: string;
  email: string;
  status: 'active' | 'inactive';
  lastActive: string;
  unreadMessages: number;
  pendingApprovals: number;
}

interface Message {
  id: number;
  senderId: number;
  senderType: 'admin' | 'client';
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: {
    id: number;
    name: string;
    type: string;
    url: string;
  }[];
  isRead: boolean;
}

interface SharedResource {
  id: number;
  title: string;
  type: 'template' | 'campaign' | 'document' | 'image';
  icon: string;
  lastUpdated: string;
  status: 'draft' | 'shared' | 'reviewed' | 'approved' | 'rejected';
  sharedBy: string;
  clientId: number;
}

interface CollaborationRequest {
  id: number;
  title: string;
  clientId: number;
  client: string;
  type: 'feedback' | 'approval' | 'information' | 'meeting';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

// Sample data
const sampleClients: Client[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    company: 'TechCorp Solutions',
    avatar: '/avatars/alex.jpg',
    email: 'alex@techcorp.com',
    status: 'active',
    lastActive: '2025-04-15T14:30:00',
    unreadMessages: 3,
    pendingApprovals: 2
  },
  {
    id: 2,
    name: 'Samantha Lee',
    company: 'Global Retail Inc.',
    avatar: '/avatars/samantha.jpg',
    email: 'slee@globalretail.com',
    status: 'active',
    lastActive: '2025-04-16T09:15:00',
    unreadMessages: 0,
    pendingApprovals: 1
  },
  {
    id: 3,
    name: 'Marcus Williams',
    company: 'Innovative Health',
    avatar: '/avatars/marcus.jpg',
    email: 'mwilliams@innovhealth.com',
    status: 'inactive',
    lastActive: '2025-04-10T16:45:00',
    unreadMessages: 5,
    pendingApprovals: 0
  },
  {
    id: 4,
    name: 'Elena Gonzalez',
    company: 'Sunrise Media Group',
    avatar: '/avatars/elena.jpg',
    email: 'elena@sunrisemedia.com',
    status: 'active',
    lastActive: '2025-04-16T11:20:00',
    unreadMessages: 1,
    pendingApprovals: 3
  },
  {
    id: 5,
    name: 'David Chen',
    company: 'Pacific Finance Partners',
    avatar: '/avatars/david.jpg',
    email: 'dchen@pacificfinance.com',
    status: 'active',
    lastActive: '2025-04-15T17:05:00',
    unreadMessages: 0,
    pendingApprovals: 0
  },
];

const sampleMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 1,
      senderType: 'client',
      senderName: 'Alex Johnson',
      senderAvatar: '/avatars/alex.jpg',
      content: 'Hi there! Could we discuss the upcoming newsletter campaign? I have some ideas for the layout.',
      timestamp: '2025-04-15T14:30:00',
      isRead: true
    },
    {
      id: 2,
      senderId: 999, // Admin
      senderType: 'admin',
      senderName: 'Admin',
      content: "Of course! I'd be happy to discuss the newsletter layout. Do you have specific sections in mind for the content?",
      timestamp: '2025-04-15T14:45:00',
      isRead: true
    },
    {
      id: 3,
      senderId: 1,
      senderType: 'client',
      senderName: 'Alex Johnson',
      senderAvatar: '/avatars/alex.jpg',
      content: 'Yes, I was thinking of highlighting our new product launch in the main section, followed by customer testimonials.',
      timestamp: '2025-04-15T15:00:00',
      isRead: true
    },
    {
      id: 4,
      senderId: 1,
      senderType: 'client',
      senderName: 'Alex Johnson',
      senderAvatar: '/avatars/alex.jpg',
      content: "I've also attached our latest product images that we could use in the newsletter.",
      timestamp: '2025-04-15T15:05:00',
      attachments: [
        {
          id: 1,
          name: 'product_images.zip',
          type: 'application/zip',
          url: '/files/product_images.zip'
        }
      ],
      isRead: true
    },
    {
      id: 5,
      senderId: 999, // Admin
      senderType: 'admin',
      senderName: 'Admin',
      content: "Those are great ideas! The product launch would make a compelling headline. I'll check the images and start working on a draft layout for you to review.",
      timestamp: '2025-04-15T15:20:00',
      isRead: true
    },
    {
      id: 6,
      senderId: 1,
      senderType: 'client',
      senderName: 'Alex Johnson',
      senderAvatar: '/avatars/alex.jpg',
      content: 'Perfect! When do you think you could have the draft ready?',
      timestamp: '2025-04-16T09:15:00',
      isRead: false
    },
    {
      id: 7,
      senderId: 1,
      senderType: 'client',
      senderName: 'Alex Johnson',
      senderAvatar: '/avatars/alex.jpg',
      content: 'Also, could we include a special offer section for our loyal customers?',
      timestamp: '2025-04-16T09:17:00',
      isRead: false
    },
    {
      id: 8,
      senderId: 1,
      senderType: 'client',
      senderName: 'Alex Johnson',
      senderAvatar: '/avatars/alex.jpg',
      content: "One more thing - here's our brand color palette reference for the newsletter design.",
      timestamp: '2025-04-16T09:25:00',
      attachments: [
        {
          id: 2,
          name: 'brand_colors.pdf',
          type: 'application/pdf',
          url: '/files/brand_colors.pdf'
        }
      ],
      isRead: false
    }
  ],
  2: [
    {
      id: 1,
      senderId: 2,
      senderType: 'client',
      senderName: 'Samantha Lee',
      senderAvatar: '/avatars/samantha.jpg',
      content: 'Hello, I wanted to check if our summer promotion email is on schedule for next week?',
      timestamp: '2025-04-14T11:30:00',
      isRead: true
    },
    {
      id: 2,
      senderId: 999, // Admin
      senderType: 'admin',
      senderName: 'Admin',
      content: "Hi Samantha! Yes, the summer promotion email is on track for next Tuesday. I'll be sending you a preview tomorrow for approval.",
      timestamp: '2025-04-14T11:45:00',
      isRead: true
    },
    {
      id: 3,
      senderId: 2,
      senderType: 'client',
      senderName: 'Samantha Lee',
      senderAvatar: '/avatars/samantha.jpg',
      content: 'Great, thank you! Looking forward to seeing the preview.',
      timestamp: '2025-04-14T12:00:00',
      isRead: true
    }
  ]
};

const sampleSharedResources: SharedResource[] = [
  {
    id: 1,
    title: 'Summer Sale Campaign',
    type: 'campaign',
    icon: 'megaphone',
    lastUpdated: '2025-04-15T14:30:00',
    status: 'shared',
    sharedBy: 'Admin',
    clientId: 1
  },
  {
    id: 2,
    title: 'Monthly Newsletter Template',
    type: 'template',
    icon: 'file-text',
    lastUpdated: '2025-04-14T10:15:00',
    status: 'approved',
    sharedBy: 'Admin',
    clientId: 1
  },
  {
    id: 3,
    title: 'Product Launch Announcement',
    type: 'campaign',
    icon: 'megaphone',
    lastUpdated: '2025-04-13T16:45:00',
    status: 'rejected',
    sharedBy: 'Admin',
    clientId: 1
  },
  {
    id: 4,
    title: 'Brand Guidelines 2025',
    type: 'document',
    icon: 'file-text',
    lastUpdated: '2025-04-10T09:30:00',
    status: 'shared',
    sharedBy: 'Admin',
    clientId: 2
  },
  {
    id: 5,
    title: 'Spring Collection Images',
    type: 'image',
    icon: 'image',
    lastUpdated: '2025-04-12T14:20:00',
    status: 'approved',
    sharedBy: 'Admin',
    clientId: 2
  }
];

const sampleCollaborationRequests: CollaborationRequest[] = [
  {
    id: 1,
    title: 'Approve Summer Campaign Design',
    clientId: 1,
    client: 'Alex Johnson',
    type: 'approval',
    status: 'pending',
    dueDate: '2025-04-20T23:59:59',
    createdAt: '2025-04-15T10:30:00',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Review Updated Brand Guidelines',
    clientId: 2,
    client: 'Samantha Lee',
    type: 'feedback',
    status: 'in-progress',
    dueDate: '2025-04-22T23:59:59',
    createdAt: '2025-04-14T09:15:00',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Campaign Performance Strategy Meeting',
    clientId: 1,
    client: 'Alex Johnson',
    type: 'meeting',
    status: 'pending',
    dueDate: '2025-04-25T14:00:00',
    createdAt: '2025-04-16T11:45:00',
    priority: 'medium'
  },
  {
    id: 4,
    title: 'Provide Q2 Marketing Calendar',
    clientId: 4,
    client: 'Elena Gonzalez',
    type: 'information',
    status: 'completed',
    dueDate: '2025-04-10T23:59:59',
    createdAt: '2025-04-05T16:20:00',
    priority: 'low'
  },
  {
    id: 5,
    title: 'Review New Product Descriptions',
    clientId: 3,
    client: 'Marcus Williams',
    type: 'feedback',
    status: 'pending',
    dueDate: '2025-04-21T23:59:59',
    createdAt: '2025-04-16T10:05:00',
    priority: 'high'
  }
];

// Helper functions
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'template':
      return <FileText className="h-5 w-5" />;
    case 'campaign':
      return <Megaphone className="h-5 w-5" />;
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'image':
      return <FileText className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
}

function getRequestIcon(type: string) {
  switch (type) {
    case 'approval':
      return <ThumbsUp className="h-5 w-5" />;
    case 'feedback':
      return <MessageSquare className="h-5 w-5" />;
    case 'information':
      return <Info className="h-5 w-5" />;
    case 'meeting':
      return <Calendar className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-blue-500';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return 'text-green-500 bg-green-50 border-green-200';
    case 'rejected':
      return 'text-red-500 bg-red-50 border-red-200';
    case 'draft':
      return 'text-gray-500 bg-gray-50 border-gray-200';
    case 'shared':
      return 'text-blue-500 bg-blue-50 border-blue-200';
    case 'reviewed':
      return 'text-amber-500 bg-amber-50 border-amber-200';
    case 'pending':
      return 'text-amber-500 bg-amber-50 border-amber-200';
    case 'in-progress':
      return 'text-blue-500 bg-blue-50 border-blue-200';
    case 'completed':
      return 'text-green-500 bg-green-50 border-green-200';
    case 'cancelled':
      return 'text-red-500 bg-red-50 border-red-200';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}

// Components
const ClientListItem: React.FC<{ client: Client; isSelected: boolean; onClick: () => void }> = ({ 
  client, 
  isSelected, 
  onClick 
}) => {
  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-100/80 to-blue-50 border border-blue-200'
          : 'hover:bg-slate-100 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10 border border-slate-200">
          <AvatarImage src={client.avatar} alt={client.name} />
          <AvatarFallback className="bg-blue-100 text-blue-800">{getInitials(client.name)}</AvatarFallback>
        </Avatar>
        {client.status === 'active' && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{client.name}</p>
        <p className="text-xs text-slate-500 truncate">{client.company}</p>
      </div>
      <div className="flex flex-col items-end">
        {client.unreadMessages > 0 && (
          <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mb-1">
            {client.unreadMessages}
          </div>
        )}
        {client.pendingApprovals > 0 && (
          <div className="bg-amber-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {client.pendingApprovals}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message; isAdmin: boolean }> = ({ message, isAdmin }) => {
  const isSentByAdmin = message.senderType === 'admin';
  
  return (
    <div 
      className={`flex ${isSentByAdmin ? 'justify-end' : 'justify-start'} mb-4 ${!message.isRead && !isSentByAdmin ? 'cursor-pointer' : ''}`}
      onClick={() => {
        // If message is from client and unread, mark as read
        if (!isSentByAdmin && !message.isRead) {
          handleMarkMessageAsRead(message.id);
        }
      }}
    >
      {!isSentByAdmin && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">{getInitials(message.senderName)}</AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[75%]`}>
        <div className={`rounded-lg p-3 ${
          isSentByAdmin 
            ? 'bg-blue-500 text-white' 
            : !message.isRead 
              ? 'bg-blue-50 border border-blue-200 text-slate-800 hover:bg-blue-100 transition-colors'
              : 'bg-white border border-slate-200 text-slate-800'
        }`}>
          <p className="text-sm">{message.content}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              {message.attachments.map(attachment => (
                <div 
                  key={attachment.id} 
                  className={`flex items-center p-2 rounded-md mt-1 ${
                    isSentByAdmin 
                      ? 'bg-blue-600/50' 
                      : 'bg-slate-100'
                  }`}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  <span className="text-xs font-medium truncate flex-1">{attachment.name}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`text-xs text-slate-500 mt-1 ${isSentByAdmin ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
          {!message.isRead && !isSentByAdmin && (
            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </div>
      </div>
      {isSentByAdmin && (
        <Avatar className="h-8 w-8 ml-2 mt-1">
          <AvatarFallback className="bg-blue-600 text-white text-xs">AM</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

const ResourceCard: React.FC<{ resource: SharedResource }> = ({ resource }) => {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`mr-3 h-9 w-9 rounded-full flex items-center justify-center ${
              resource.type === 'campaign' ? 'bg-amber-100' : 
              resource.type === 'template' ? 'bg-blue-100' : 
              resource.type === 'document' ? 'bg-purple-100' : 'bg-green-100'
            }`}>
              {getResourceIcon(resource.type)}
            </div>
            <div>
              <CardTitle className="text-base">{resource.title}</CardTitle>
              <CardDescription className="text-xs">
                Shared by {resource.sharedBy} on {formatDate(resource.lastUpdated)}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(resource.status)} capitalize`}
          >
            {resource.status}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="pt-0 pb-3">
        <div className="flex justify-between w-full text-xs">
          <span className="text-slate-500">Last updated: {formatTime(resource.lastUpdated)}</span>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <FileEdit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const CollaborationRequestCard: React.FC<{ request: CollaborationRequest }> = ({ request }) => {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`mr-3 h-9 w-9 rounded-full flex items-center justify-center ${
              request.type === 'approval' ? 'bg-green-100' : 
              request.type === 'feedback' ? 'bg-amber-100' : 
              request.type === 'information' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              {getRequestIcon(request.type)}
            </div>
            <div>
              <CardTitle className="text-base">{request.title}</CardTitle>
              <CardDescription className="text-xs">
                For {request.client} • Created on {formatDate(request.createdAt)}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(request.status)} capitalize`}
            >
              {request.status}
            </Badge>
            <div className="flex items-center text-xs">
              <span className={`h-2 w-2 rounded-full ${getPriorityColor(request.priority)} mr-1`}></span>
              <span className="text-slate-500 capitalize">{request.priority} priority</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-0 pb-3">
        <div className="flex justify-between w-full text-xs">
          <span className="text-slate-500 flex items-center">
            <Clock className="h-3 w-3 mr-1 text-slate-400" />
            Due: {formatDateTime(request.dueDate)}
          </span>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <FileEdit className="h-3 w-3 mr-1" />
              Update
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Discuss
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Main component
export default function ClientCollaboration() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Filter clients based on search query
  const filteredClients = sampleClients.filter(client => 
    client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  // Select client and load their data
  useEffect(() => {
    if (selectedClient) {
      // Load messages for the selected client
      const clientMessages = sampleMessages[selectedClient.id] || [];
      setMessages(clientMessages);
      
      // Load resources for the selected client
      const clientResources = sampleSharedResources.filter(
        resource => resource.clientId === selectedClient.id
      );
      setSharedResources(clientResources);
      
      // Load collaboration requests for the selected client
      const clientRequests = sampleCollaborationRequests.filter(
        request => request.clientId === selectedClient.id
      );
      setCollaborationRequests(clientRequests);
    }
  }, [selectedClient]);

  // If no client is selected, select the first one by default
  useEffect(() => {
    if (filteredClients.length > 0 && !selectedClient) {
      setSelectedClient(filteredClients[0]);
    }
  }, [filteredClients, selectedClient]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedClient) return;
    
    const newMessageObj: Message = {
      id: Math.max(0, ...messages.map(m => m.id)) + 1,
      senderId: 999, // Admin user ID
      senderType: 'admin',
      senderName: 'Admin',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    setMessages([...messages, newMessageObj]);
    setNewMessage('');
    
    toast({
      title: "Message sent",
      description: `Message sent to ${selectedClient.name}`,
      variant: "default",
    });
  };

  // Handle creating a new collaboration request
  const handleCreateRequest = () => {
    if (!selectedClient) return;
    
    toast({
      title: "Feature coming soon",
      description: "This functionality will be available in a future update.",
      variant: "default",
    });
  };

  // Handle sharing a new resource
  const handleShareResource = () => {
    if (!selectedClient) return;
    
    toast({
      title: "Feature coming soon",
      description: "This functionality will be available in a future update.",
      variant: "default",
    });
  };

  // Add a client
  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Create a new client
    const newClient = {
      id: Math.max(0, ...sampleClients.map(c => c.id)) + 1,
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || "",
      status: "active" as const,
      avatar: "",
      lastActive: new Date().toISOString(),
      unreadMessages: 0,
      pendingApprovals: 0
    };
    
    // Add client to the list
    sampleClients.push(newClient);
    
    // Select the new client
    setSelectedClient(newClient);
    
    // Close the dialog
    setIsAddClientDialogOpen(false);
    
    // Show toast
    toast({
      title: "Client added",
      description: `Client ${newClient.name} has been added successfully.`,
    });
  };
  
  // Mark a message as read
  const handleMarkMessageAsRead = (messageId: number) => {
    // Update messages in state
    const updatedMessages = messages.map(message => 
      message.id === messageId ? { ...message, isRead: true } : message
    );
    setMessages(updatedMessages);
    
    // Update unread count in the client
    if (selectedClient) {
      const updatedClient = { 
        ...selectedClient, 
        unreadMessages: Math.max(0, selectedClient.unreadMessages - 1)
      };
      setSelectedClient(updatedClient);
      
      // Update in the sample data
      const clientIndex = sampleClients.findIndex(c => c.id === selectedClient.id);
      if (clientIndex >= 0) {
        sampleClients[clientIndex] = updatedClient;
      }
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Add Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to collaborate with. This will create a new client profile that you can manage.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddClient}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="John Smith" 
                  className="col-span-3" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input 
                  id="company" 
                  name="company"
                  placeholder="Acme Inc." 
                  className="col-span-3" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  placeholder="john@example.com" 
                  className="col-span-3" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input 
                  id="phone" 
                  name="phone"
                  placeholder="+1 (555) 123-4567" 
                  className="col-span-3" 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Client</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Client Collaboration Portal</h1>
        <p className="text-slate-500 mb-6">
          Manage communications, resources sharing, and collaboration activities with your clients
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Client sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-180px)]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-lg font-semibold">Clients</CardTitle>
                <Button 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => setIsAddClientDialogOpen(true)}
                >
                  <UserPlus size={14} />
                  Add
                </Button>
              </div>
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search clients..."
                  className="pl-8 h-9 text-sm"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-270px)] px-3">
              <div className="space-y-2 pt-2">
                {filteredClients.map((client) => (
                  <ClientListItem
                    key={client.id}
                    client={client}
                    isSelected={selectedClient?.id === client.id}
                    onClick={() => setSelectedClient(client)}
                  />
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          {selectedClient ? (
            <Card className="h-[calc(100vh-180px)]">
              <CardHeader className="pb-0 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3 border border-slate-200">
                      <AvatarImage src={selectedClient.avatar} alt={selectedClient.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {getInitials(selectedClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-lg font-semibold">{selectedClient.name}</h2>
                        <Badge variant="outline" className="ml-2 text-xs capitalize">
                          {selectedClient.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-slate-500">
                        <Building className="h-3 w-3 mr-1" />
                        {selectedClient.company}
                        <span className="mx-2">•</span>
                        <Mail className="h-3 w-3 mr-1" />
                        {selectedClient.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          sessionStorage.setItem('selectedClientId', selectedClient.id.toString());
                          setLocation('/client-management');
                        }}>
                          <FileEdit className="h-4 w-4 mr-2" />
                          View Client Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateRequest()}>
                          <ListChecks className="h-4 w-4 mr-2" />
                          Create New Request
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareResource()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Share New Resource
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="messages" className="text-xs">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                      {selectedClient.unreadMessages > 0 && (
                        <span className="ml-2 bg-blue-500 text-white px-1.5 rounded-full text-xs">
                          {selectedClient.unreadMessages}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="text-xs">
                      <FileText className="h-4 w-4 mr-2" />
                      Shared Resources
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="text-xs">
                      <ListChecks className="h-4 w-4 mr-2" />
                      Collaboration
                      {selectedClient.pendingApprovals > 0 && (
                        <span className="ml-2 bg-amber-500 text-white px-1.5 rounded-full text-xs">
                          {selectedClient.pendingApprovals}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsContent 
                  value="messages" 
                  className="p-0 m-0 flex flex-col h-[calc(100vh-305px)]"
                >
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble 
                          key={message.id} 
                          message={message}
                          isAdmin={message.senderType === 'admin'}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                
                  <div className="p-3 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Type your message..."
                        className="min-h-[60px] text-sm"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <div className="flex flex-col space-y-2">
                        <Button 
                          size="sm" 
                          className="h-9 w-9 p-0"
                          onClick={() => toast({
                            title: "Feature coming soon",
                            description: "This functionality will be available in a future update.",
                            variant: "default",
                          })}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
              </TabsContent>
              
              <TabsContent 
                value="resources" 
                className="p-0 m-0 flex flex-col h-[calc(100vh-305px)]"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="text-sm font-medium">
                    {sharedResources.length} Shared Resources
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => toast({
                        title: "Feature coming soon",
                        description: "This functionality will be available in a future update.",
                        variant: "default",
                      })}
                    >
                      <Filter size={14} />
                      Filter
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={handleShareResource}
                    >
                      <Upload size={14} />
                      Share New
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {sharedResources.length > 0 ? (
                      sharedResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 mb-1">No shared resources</h3>
                        <p className="text-sm text-slate-500 mb-3">You haven't shared any resources with this client yet.</p>
                        <Button size="sm" onClick={handleShareResource}>
                          <Upload className="h-4 w-4 mr-2" />
                          Share Resource
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="requests" 
                className="p-0 m-0 flex flex-col h-[calc(100vh-305px)]"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="text-sm font-medium">
                    {collaborationRequests.length} Collaboration Requests
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => toast({
                        title: "Feature coming soon",
                        description: "This functionality will be available in a future update.",
                        variant: "default",
                      })}
                    >
                      <Filter size={14} />
                      Filter
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={handleCreateRequest}
                    >
                      <ListChecks size={14} />
                      New Request
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {collaborationRequests.length > 0 ? (
                      collaborationRequests.map((request) => (
                        <CollaborationRequestCard key={request.id} request={request} />
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <ListChecks className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 mb-1">No collaboration requests</h3>
                        <p className="text-sm text-slate-500 mb-3">You haven't created any collaboration requests for this client yet.</p>
                        <Button size="sm" onClick={handleCreateRequest}>
                          <ListChecks className="h-4 w-4 mr-2" />
                          Create Request
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="h-[calc(100vh-180px)] flex items-center justify-center">
              <div className="text-center p-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">No clients selected</h3>
                <p className="text-sm text-slate-500 mb-3">Please select a client from the list to view their collaboration details.</p>
                <Button size="sm" onClick={() => setLocation("/client-management")}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Manage Clients
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom icon is no longer needed as we're using the Download icon from lucide-react