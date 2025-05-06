import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  BarChart, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  Line, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  FileText, 
  Users, 
  Activity, 
  MoreVertical,
  Calendar,
  Search,
  FileUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react';
import DateRangePicker from '@/components/DateRangePicker';
import AdminLayout from '@/components/AdminLayout';

// Activity status badge component
const ActivityTypeBadge = ({ type }: { type: string }) => {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'campaign':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'contact':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'template':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'auth':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'settings':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(type)}`}>
      {type}
    </span>
  );
};

// Upload status badge component
const UploadStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'processing':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'failed':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <AlertCircle className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status}
    </span>
  );
};

// File size formatter
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Date formatter
const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

const AdminMonitoring = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch statistics data
  const { 
    data: statsData, 
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['/api/admin/monitoring/activity-stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch activities data with pagination and filters
  const { 
    data: activitiesData, 
    isLoading: isActivitiesLoading,
    error: activitiesError,
    refetch: refetchActivities
  } = useQuery({
    queryKey: [
      '/api/admin/monitoring/activities', 
      currentPage, 
      pageSize, 
      dateRange.startDate.toISOString(), 
      dateRange.endDate.toISOString(),
      actionTypeFilter
    ],
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch uploads data with pagination and filters
  const { 
    data: uploadsData, 
    isLoading: isUploadsLoading,
    error: uploadsError,
    refetch: refetchUploads
  } = useQuery({
    queryKey: [
      '/api/admin/monitoring/uploads', 
      currentPage, 
      pageSize, 
      dateRange.startDate.toISOString(), 
      dateRange.endDate.toISOString(),
      statusFilter
    ],
    staleTime: 60 * 1000, // 1 minute
  });

  // Handle date range changes
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    // Refetch data with new date range
    refetchActivities();
    refetchUploads();
    refetchStats();
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset page when switching tabs
  };

  // Handle action type filter changes
  const handleActionTypeChange = (value: string) => {
    setActionTypeFilter(value);
    setCurrentPage(1); // Reset page when changing filter
  };

  // Handle status filter changes
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset page when changing filter
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Prepare chart data for activity types
  const activityTypeChartData = useMemo(() => {
    if (!statsData || !statsData.activities || !statsData.activities.byType) {
      return [];
    }
    return statsData.activities.byType.map((item: any) => ({
      name: item.type,
      value: item.count
    }));
  }, [statsData]);

  // Prepare chart data for action types
  const actionChartData = useMemo(() => {
    if (!statsData || !statsData.activities || !statsData.activities.byAction) {
      return [];
    }
    return statsData.activities.byAction.map((item: any) => ({
      name: item.action,
      value: item.count
    }));
  }, [statsData]);

  // Prepare chart data for upload types
  const uploadTypeChartData = useMemo(() => {
    if (!statsData || !statsData.uploads || !statsData.uploads.byType) {
      return [];
    }
    return statsData.uploads.byType.map((item: any) => ({
      name: item.type,
      value: item.count
    }));
  }, [statsData]);

  // Prepare chart data for upload statuses
  const uploadStatusChartData = useMemo(() => {
    if (!statsData || !statsData.uploads || !statsData.uploads.byStatus) {
      return [];
    }
    return statsData.uploads.byStatus.map((item: any) => ({
      name: item.status,
      value: item.count
    }));
  }, [statsData]);

  // Prepare chart data for activity trend
  const activityTrendData = useMemo(() => {
    if (!statsData || !statsData.activities || !statsData.activities.trend) {
      return [];
    }
    return statsData.activities.trend.map((item: any) => ({
      date: format(new Date(item.date), 'MMM dd'),
      count: item.count
    }));
  }, [statsData]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Renders the activity statistics
  const renderActivityStats = () => {
    if (isStatsLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (statsError) {
      return (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-destructive">
              <AlertCircle className="mx-auto h-10 w-10 mb-2" />
              <h3 className="font-medium text-lg">Error Loading Statistics</h3>
              <p className="text-muted-foreground">
                There was a problem loading the activity statistics.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.activities?.total.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {statsData?.activities?.uniqueClients || 0} unique clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.uploads?.total.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Files processed by the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Action Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.activities?.byType?.[0]?.type || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsData?.activities?.byType?.[0]?.count?.toLocaleString() || 0} activities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Upload Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData?.uploads?.byType?.[0]?.type || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsData?.uploads?.byType?.[0]?.count?.toLocaleString() || 0} uploads
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renders the activity charts
  const renderActivityCharts = () => {
    if (isStatsLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>Daily activity count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {activityTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityTrendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Activities"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No trend data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>Distribution by type and action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-40">
                <p className="text-sm font-medium text-center mb-2">By Type</p>
                {activityTypeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityTypeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {activityTypeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="h-40">
                <p className="text-sm font-medium text-center mb-2">By Action</p>
                {actionChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={actionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {actionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="h-40">
                <p className="text-sm font-medium text-center mb-2">Upload Types</p>
                {uploadTypeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={uploadTypeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {uploadTypeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="h-40">
                <p className="text-sm font-medium text-center mb-2">Upload Status</p>
                {uploadStatusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={uploadStatusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {uploadStatusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renders the activities list
  const renderActivitiesList = () => {
    if (isActivitiesLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (activitiesError) {
      return (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-destructive">
              <AlertCircle className="mx-auto h-10 w-10 mb-2" />
              <h3 className="font-medium text-lg">Error Loading Activities</h3>
              <p className="text-muted-foreground">
                There was a problem loading the activity list.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!activitiesData?.activities || activitiesData.activities.length === 0) {
      return (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">No Activities Found</h3>
              <p className="text-muted-foreground">
                No activities match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activitiesData.activities.map((activity: any) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-mono text-xs">
                    {formatDate(activity.createdAt)}
                  </TableCell>
                  <TableCell>{activity.clientName}</TableCell>
                  <TableCell>{activity.userName || 'System'}</TableCell>
                  <TableCell>
                    <ActivityTypeBadge type={activity.actionType} />
                  </TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell className="max-w-sm truncate">
                    {activity.description || '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {activitiesData?.pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, activitiesData.pagination.total)} of {activitiesData.pagination.total} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, Math.ceil(activitiesData.pagination.total / pageSize)) }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(activitiesData.pagination.total / pageSize)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  };

  // Renders the uploads list
  const renderUploadsList = () => {
    if (isUploadsLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (uploadsError) {
      return (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-destructive">
              <AlertCircle className="mx-auto h-10 w-10 mb-2" />
              <h3 className="font-medium text-lg">Error Loading Uploads</h3>
              <p className="text-muted-foreground">
                There was a problem loading the upload list.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!uploadsData?.uploads || uploadsData.uploads.length === 0) {
      return (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <FileUp className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">No Uploads Found</h3>
              <p className="text-muted-foreground">
                No file uploads match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>User</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadsData.uploads.map((upload: any) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-mono text-xs">
                    {formatDate(upload.uploadedAt)}
                  </TableCell>
                  <TableCell>{upload.clientName}</TableCell>
                  <TableCell>{upload.userName || 'System'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {upload.originalFilename || upload.filename}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{upload.type}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(upload.fileSize)}</TableCell>
                  <TableCell>
                    <UploadStatusBadge status={upload.status} />
                  </TableCell>
                  <TableCell>
                    {upload.totalRecords > 0 ? (
                      `${upload.processedRecords} / ${upload.totalRecords}`
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {uploadsData?.pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, uploadsData.pagination.total)} of {uploadsData.pagination.total} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, Math.ceil(uploadsData.pagination.total / pageSize)) }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(uploadsData.pagination.total / pageSize)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Activity Monitoring</h2>
            <p className="text-muted-foreground">
              Track and analyze client activity and file uploads.
            </p>
          </div>
          <DateRangePicker
            onChange={handleDateRangeChange}
            defaultDateRange={dateRange}
          />
        </div>
        
        <Separator />
        
        {/* Activity Stats Cards */}
        {renderActivityStats()}
        
        <Separator />
        
        {/* Activity Charts */}
        {renderActivityCharts()}
        
        <Tabs defaultValue="activities" value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TabsList>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              {activeTab === 'activities' && (
                <Select
                  value={actionTypeFilter}
                  onValueChange={handleActionTypeChange}
                >
                  <SelectTrigger className="sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {activeTab === 'uploads' && (
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => setPageSize(parseInt(val))}
              >
                <SelectTrigger className="sm:w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <TabsContent value="activities" className="mt-0">
              {renderActivitiesList()}
            </TabsContent>
            <TabsContent value="uploads" className="mt-0">
              {renderUploadsList()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMonitoring;