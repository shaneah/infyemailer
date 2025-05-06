import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Activity,
  FileText,
  Upload,
  Users,
  Download,
  Search,
  Filter,
  Calendar,
  RefreshCcw,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Activity type definition
interface Activity {
  id: number;
  clientId: number;
  clientName: string;
  clientCompany: string;
  clientUserId?: number;
  userName?: string;
  action: string;
  actionType: string;
  entityId?: number;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: any;
}

// Upload type definition
interface Upload {
  id: number;
  clientId: number;
  clientName: string;
  clientCompany: string;
  clientUserId?: number;
  userName?: string;
  type: string;
  filename: string;
  originalFilename?: string;
  fileSize: number;
  mimeType?: string;
  status: string;
  processedRecords: number;
  totalRecords: number;
  errorCount: number;
  errors?: any;
  uploadedAt: string;
  processedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

// Stats type definition
interface Stats {
  activities: {
    total: number;
    uniqueClients: number;
    byType: Array<{ type: string; count: number }>;
    byAction: Array<{ action: string; count: number }>;
    trend: Array<{ date: string; count: number }>;
  };
  uploads: {
    total: number;
    byType: Array<{ type: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
}

// Filter state interfaces
interface ActivityFilters {
  clientId?: number;
  startDate?: Date;
  endDate?: Date;
  action?: string;
  actionType?: string;
  limit: number;
  offset: number;
}

interface UploadFilters {
  clientId?: number;
  startDate?: Date;
  endDate?: Date;
  type?: string;
  status?: string;
  limit: number;
  offset: number;
}

const AdminMonitoring: React.FC = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [activityFilters, setActivityFilters] = useState<ActivityFilters>({
    limit: 10,
    offset: 0,
  });
  const [uploadFilters, setUploadFilters] = useState<UploadFilters>({
    limit: 10,
    offset: 0,
  });
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

  // Fetch statistics
  const { 
    data: stats, 
    isLoading: statsLoading, 
    refetch: refetchStats 
  } = useQuery<Stats>({
    queryKey: ['/api/admin/monitoring/activity-stats'],
    enabled: tab === 'overview',
  });

  // Fetch activities
  const { 
    data: activitiesData, 
    isLoading: activitiesLoading,
    refetch: refetchActivities
  } = useQuery<{ activities: Activity[], pagination: { total: number, limit: number, offset: number } }>({
    queryKey: [
      '/api/admin/monitoring/activities', 
      activityFilters
    ],
    enabled: tab === 'activities',
  });

  // Fetch uploads
  const { 
    data: uploadsData, 
    isLoading: uploadsLoading,
    refetch: refetchUploads
  } = useQuery<{ uploads: Upload[], pagination: { total: number, limit: number, offset: number } }>({
    queryKey: [
      '/api/admin/monitoring/uploads', 
      uploadFilters
    ],
    enabled: tab === 'uploads',
  });

  // Handle pagination for activities
  const handleActivityPageChange = (newOffset: number) => {
    setActivityFilters(prev => ({
      ...prev,
      offset: newOffset
    }));
  };

  // Handle pagination for uploads
  const handleUploadPageChange = (newOffset: number) => {
    setUploadFilters(prev => ({
      ...prev,
      offset: newOffset
    }));
  };

  // Apply activity filters
  const applyActivityFilters = (filters: Partial<ActivityFilters>) => {
    setActivityFilters(prev => ({
      ...prev,
      ...filters,
      offset: 0 // Reset to first page when filters change
    }));
  };

  // Apply upload filters
  const applyUploadFilters = (filters: Partial<UploadFilters>) => {
    setUploadFilters(prev => ({
      ...prev,
      ...filters,
      offset: 0 // Reset to first page when filters change
    }));
  };

  // Reset filters
  const resetActivityFilters = () => {
    setActivityFilters({
      limit: 10,
      offset: 0
    });
  };

  const resetUploadFilters = () => {
    setUploadFilters({
      limit: 10,
      offset: 0
    });
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-500';
      case 'pending':
      case 'processing':
        return 'bg-yellow-500';
      case 'failed':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const color = status.toLowerCase() === 'completed' || status.toLowerCase() === 'success' 
      ? 'success'
      : status.toLowerCase() === 'pending' || status.toLowerCase() === 'processing'
        ? 'warning'
        : status.toLowerCase() === 'failed' || status.toLowerCase() === 'error'
          ? 'destructive'
          : 'secondary';
          
    return <Badge variant={color}>{status}</Badge>;
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Render overview tab
  const renderOverview = () => {
    if (statsLoading) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4">
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0 h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0 h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No statistics available</h3>
          <p className="text-gray-500 mt-2">
            Statistics couldn't be loaded. Please try again later.
          </p>
          <Button 
            className="mt-4"
            onClick={() => refetchStats()}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Key stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activities.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.activities.uniqueClients} clients
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uploads.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uploads.byStatus.find(s => s.status.toLowerCase() === 'completed')?.count || 0} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activities.uniqueClients}</div>
              <p className="text-xs text-muted-foreground">
                With activity in the system
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Activity</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {stats.activities.byAction[0]?.action || 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.activities.byAction[0]?.count || 0} occurrences
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Activity trends and Upload statistics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>
                Activity distribution over the last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {/* We could add a chart library like recharts here */}
                <div className="space-y-4">
                  {stats.activities.trend.map((day) => (
                    <div key={day.date} className="flex items-center">
                      <div className="w-24 text-xs text-muted-foreground">
                        {format(parseISO(day.date), 'MMM d')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Progress value={(day.count / Math.max(...stats.activities.trend.map(d => d.count))) * 100} className="h-2" />
                          <span className="ml-2 text-sm">{day.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upload Statistics</CardTitle>
              <CardDescription>
                Distribution by type and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">By Type</h4>
                  <div className="space-y-2">
                    {stats.uploads.byType.map((type) => (
                      <div key={type.type} className="flex items-center">
                        <div className="w-24 capitalize text-xs text-muted-foreground">
                          {type.type}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Progress value={(type.count / stats.uploads.total) * 100} className="h-2" />
                            <span className="ml-2 text-sm">{type.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">By Status</h4>
                  <div className="space-y-2">
                    {stats.uploads.byStatus.map((status) => (
                      <div key={status.status} className="flex items-center">
                        <div className="w-24 capitalize text-xs text-muted-foreground flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(status.status)}`}></span>
                          {status.status}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Progress value={(status.count / stats.uploads.total) * 100} className="h-2" />
                            <span className="ml-2 text-sm">{status.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Activity types and actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity Types</CardTitle>
              <CardDescription>
                Distribution by activity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.activities.byType.map((type) => (
                  <div key={type.type} className="flex items-center">
                    <div className="w-24 capitalize text-xs text-muted-foreground">
                      {type.type}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Progress value={(type.count / stats.activities.total) * 100} className="h-2" />
                        <span className="ml-2 text-sm">{type.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Actions</CardTitle>
              <CardDescription>
                Distribution by activity action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.activities.byAction.slice(0, 8).map((action) => (
                  <div key={action.action} className="flex items-center">
                    <div className="w-24 capitalize text-xs text-muted-foreground">
                      {action.action}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Progress value={(action.count / stats.activities.total) * 100} className="h-2" />
                        <span className="ml-2 text-sm">{action.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Render activities tab
  const renderActivities = () => {
    if (activitiesLoading) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/40 rounded-lg p-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!activitiesData || activitiesData.activities.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Activity className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No activities found</h3>
          <p className="text-gray-500 mt-2">
            {Object.keys(activityFilters).length > 2 
              ? "Try removing some filters or try a different search."
              : "There are no client activities to display."}
          </p>
          {Object.keys(activityFilters).length > 2 && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={resetActivityFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Filter controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={activityFilters.actionType || ""}
                onValueChange={(value) => applyActivityFilters({ actionType: value || undefined })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={activityFilters.action || ""}
                onValueChange={(value) => applyActivityFilters({ action: value || undefined })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <DateRangePicker
                from={activityFilters.startDate}
                to={activityFilters.endDate}
                onFromChange={(date) => applyActivityFilters({ startDate: date })}
                onToChange={(date) => applyActivityFilters({ endDate: date })}
              />
            </div>
          </div>
          
          <div>
            <Button onClick={() => refetchActivities()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Activities table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitiesData.activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{activity.clientName}</div>
                          <div className="text-xs text-muted-foreground">{activity.clientCompany}</div>
                        </div>
                      </TableCell>
                      <TableCell>{activity.userName || "—"}</TableCell>
                      <TableCell>
                        <Badge className="capitalize">{activity.action}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{activity.actionType}</TableCell>
                      <TableCell>{formatDate(activity.createdAt)}</TableCell>
                      <TableCell>{activity.ipAddress || "—"}</TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedActivity(activity)}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px]">
                            <SheetHeader>
                              <SheetTitle>Activity Details</SheetTitle>
                              <SheetDescription>
                                Detailed information about this activity.
                              </SheetDescription>
                            </SheetHeader>
                            {selectedActivity && (
                              <div className="mt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">ID</h4>
                                    <p>{selectedActivity.id}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Date</h4>
                                    <p>{formatDate(selectedActivity.createdAt)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Client</h4>
                                    <p>{selectedActivity.clientName} ({selectedActivity.clientId})</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Company</h4>
                                    <p>{selectedActivity.clientCompany}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">User</h4>
                                    <p>{selectedActivity.userName || "—"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">User ID</h4>
                                    <p>{selectedActivity.clientUserId || "—"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Action</h4>
                                    <p className="capitalize">{selectedActivity.action}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                                    <p className="capitalize">{selectedActivity.actionType}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Entity ID</h4>
                                    <p>{selectedActivity.entityId || "—"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">IP Address</h4>
                                    <p>{selectedActivity.ipAddress || "—"}</p>
                                  </div>
                                </div>
                                
                                {selectedActivity.description && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                                    <p className="text-sm">{selectedActivity.description}</p>
                                  </div>
                                )}
                                
                                {selectedActivity.userAgent && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">User Agent</h4>
                                    <p className="text-xs font-mono bg-muted p-2 rounded">{selectedActivity.userAgent}</p>
                                  </div>
                                )}
                                
                                {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Metadata</h4>
                                    <pre className="text-xs font-mono bg-muted p-2 rounded overflow-auto max-h-[200px]">
                                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Pagination */}
        {activitiesData.pagination.total > activitiesData.pagination.limit && (
          <Pagination className="mx-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handleActivityPageChange(Math.max(0, activityFilters.offset - activityFilters.limit))}
                  isActive={activityFilters.offset > 0}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, Math.ceil(activitiesData.pagination.total / activitiesData.pagination.limit)) }).map((_, i) => {
                const currentPage = Math.floor(activityFilters.offset / activityFilters.limit);
                const totalPages = Math.ceil(activitiesData.pagination.total / activitiesData.pagination.limit);
                let pageNum = i;
                
                // Strategy for showing pagination when there are many pages
                if (totalPages > 5) {
                  if (currentPage < 3) {
                    // Show first 5 pages
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    // Show last 5 pages
                    pageNum = totalPages - 5 + i;
                  } else {
                    // Show current page and 2 pages before/after
                    pageNum = currentPage - 2 + i;
                  }
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handleActivityPageChange(pageNum * activitiesData.pagination.limit)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {Math.ceil(activitiesData.pagination.total / activitiesData.pagination.limit) > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handleActivityPageChange(activityFilters.offset + activityFilters.limit)}
                  isActive={activityFilters.offset + activityFilters.limit < activitiesData.pagination.total}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  // Render uploads tab
  const renderUploads = () => {
    if (uploadsLoading) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/40 rounded-lg p-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Filename</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!uploadsData || uploadsData.uploads.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No uploads found</h3>
          <p className="text-gray-500 mt-2">
            {Object.keys(uploadFilters).length > 2 
              ? "Try removing some filters or try a different search."
              : "There are no client uploads to display."}
          </p>
          {Object.keys(uploadFilters).length > 2 && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={resetUploadFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Filter controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={uploadFilters.type || ""}
                onValueChange={(value) => applyUploadFilters({ type: value || undefined })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="contacts">Contacts</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="attachment">Attachment</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={uploadFilters.status || ""}
                onValueChange={(value) => applyUploadFilters({ status: value || undefined })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <DateRangePicker
                from={uploadFilters.startDate}
                to={uploadFilters.endDate}
                onFromChange={(date) => applyUploadFilters({ startDate: date })}
                onToChange={(date) => applyUploadFilters({ endDate: date })}
              />
            </div>
          </div>
          
          <div>
            <Button onClick={() => refetchUploads()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Uploads table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadsData.uploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>{upload.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{upload.clientName}</div>
                          <div className="text-xs text-muted-foreground">{upload.clientCompany}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{upload.type}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={upload.originalFilename || upload.filename}>
                        {upload.originalFilename || upload.filename}
                      </TableCell>
                      <TableCell>{formatFileSize(upload.fileSize)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(upload.status)}
                          {getStatusBadge(upload.status)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(upload.uploadedAt)}</TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedUpload(upload)}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px]">
                            <SheetHeader>
                              <SheetTitle>Upload Details</SheetTitle>
                              <SheetDescription>
                                Detailed information about this file upload.
                              </SheetDescription>
                            </SheetHeader>
                            {selectedUpload && (
                              <div className="mt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">ID</h4>
                                    <p>{selectedUpload.id}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Upload Date</h4>
                                    <p>{formatDate(selectedUpload.uploadedAt)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Client</h4>
                                    <p>{selectedUpload.clientName} ({selectedUpload.clientId})</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Company</h4>
                                    <p>{selectedUpload.clientCompany}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">User</h4>
                                    <p>{selectedUpload.userName || "—"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                                    <p className="capitalize">{selectedUpload.type}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Filename</h4>
                                    <p className="truncate">{selectedUpload.originalFilename || selectedUpload.filename}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Size</h4>
                                    <p>{formatFileSize(selectedUpload.fileSize)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">MIME Type</h4>
                                    <p>{selectedUpload.mimeType || "—"}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(selectedUpload.status)}
                                      <span className="capitalize">{selectedUpload.status}</span>
                                      {selectedUpload.processedAt && (
                                        <span className="text-xs text-muted-foreground">
                                          (Processed: {formatDate(selectedUpload.processedAt)})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {selectedUpload.totalRecords > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Processing Status</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Progress: {selectedUpload.processedRecords} / {selectedUpload.totalRecords}</span>
                                        <span>{Math.round((selectedUpload.processedRecords / selectedUpload.totalRecords) * 100)}%</span>
                                      </div>
                                      <Progress 
                                        value={(selectedUpload.processedRecords / selectedUpload.totalRecords) * 100} 
                                        className="h-2"
                                      />
                                      {selectedUpload.errorCount > 0 && (
                                        <p className="text-xs text-red-500">
                                          {selectedUpload.errorCount} errors encountered
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {selectedUpload.errors && Object.keys(selectedUpload.errors).length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Errors</h4>
                                    <div className="bg-muted p-2 rounded overflow-auto max-h-[200px]">
                                      <pre className="text-xs font-mono text-red-500">
                                        {JSON.stringify(selectedUpload.errors, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Connection Info</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">IP Address</p>
                                      <p className="text-sm">{selectedUpload.ipAddress || "—"}</p>
                                    </div>
                                    {selectedUpload.userAgent && (
                                      <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground">User Agent</p>
                                        <p className="text-xs font-mono truncate">{selectedUpload.userAgent}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {selectedUpload.metadata && Object.keys(selectedUpload.metadata).length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Metadata</h4>
                                    <pre className="text-xs font-mono bg-muted p-2 rounded overflow-auto max-h-[200px]">
                                      {JSON.stringify(selectedUpload.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Pagination */}
        {uploadsData.pagination.total > uploadsData.pagination.limit && (
          <Pagination className="mx-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handleUploadPageChange(Math.max(0, uploadFilters.offset - uploadFilters.limit))}
                  isActive={uploadFilters.offset > 0}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, Math.ceil(uploadsData.pagination.total / uploadsData.pagination.limit)) }).map((_, i) => {
                const currentPage = Math.floor(uploadFilters.offset / uploadFilters.limit);
                const totalPages = Math.ceil(uploadsData.pagination.total / uploadsData.pagination.limit);
                let pageNum = i;
                
                // Strategy for showing pagination when there are many pages
                if (totalPages > 5) {
                  if (currentPage < 3) {
                    // Show first 5 pages
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    // Show last 5 pages
                    pageNum = totalPages - 5 + i;
                  } else {
                    // Show current page and 2 pages before/after
                    pageNum = currentPage - 2 + i;
                  }
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handleUploadPageChange(pageNum * uploadsData.pagination.limit)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {Math.ceil(uploadsData.pagination.total / uploadsData.pagination.limit) > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handleUploadPageChange(uploadFilters.offset + uploadFilters.limit)}
                  isActive={uploadFilters.offset + uploadFilters.limit < uploadsData.pagination.total}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Client Activity Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor all client activities and data uploads across the platform.
          </p>
        </div>
        
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activities">
              <FileText className="h-4 w-4 mr-2" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="uploads">
              <Upload className="h-4 w-4 mr-2" />
              Data Uploads
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-4">
            {renderActivities()}
          </TabsContent>
          
          <TabsContent value="uploads" className="space-y-4">
            {renderUploads()}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMonitoring;