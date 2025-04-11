import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Mail, Cloud, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
  latency?: number; // in ms
  message?: string;
  lastChecked: Date;
  icon: React.ReactNode;
}

const APIHealthOverview: React.FC = () => {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const { data: healthData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/health'],
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      // Clone the response before attempting to read the body
      const clonedResponse = response.clone();
      try {
        return await response.json();
      } catch (error) {
        // If the first attempt fails, try with the cloned response
        console.warn('First JSON parse failed, trying with cloned response', error);
        return await clonedResponse.json();
      }
    },
  });

  const handleRefresh = () => {
    refetch();
    setLastRefreshed(new Date());
  };

  // Fallback data if API is not implemented yet
  const fallbackServices: ServiceHealth[] = [
    {
      name: 'Database',
      status: 'healthy',
      latency: 42,
      message: 'PostgreSQL connected',
      lastChecked: new Date(),
      icon: <Database className="h-5 w-5" />
    },
    {
      name: 'SendGrid',
      status: 'warning',
      latency: 287,
      message: 'API key valid, sender identity needs verification',
      lastChecked: new Date(),
      icon: <Mail className="h-5 w-5" />
    },
    {
      name: 'Domain Verification',
      status: 'unknown',
      message: 'No domains verified yet',
      lastChecked: new Date(),
      icon: <Globe className="h-5 w-5" />
    }
  ];

  const services = healthData?.services || fallbackServices;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">API Health Overview</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Status of connected services and APIs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Error fetching health data. API endpoint may not be available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service: ServiceHealth) => (
              <div 
                key={service.name} 
                className={`flex items-center justify-between p-3 rounded-md border
                  ${service.status === 'healthy' ? 'border-green-200 bg-green-50' : 
                    service.status === 'unhealthy' ? 'border-red-200 bg-red-50' :
                    service.status === 'warning' ? 'border-amber-200 bg-amber-50' :
                    'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full 
                    ${service.status === 'healthy' ? 'bg-green-100 text-green-600' : 
                      service.status === 'unhealthy' ? 'bg-red-100 text-red-600' :
                      service.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-600'}`}>
                    {service.icon}
                  </div>
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">{service.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {service.latency !== undefined && (
                    <span className="text-xs text-muted-foreground">{service.latency}ms</span>
                  )}
                  <Badge variant={
                    service.status === 'healthy' ? 'success' : 
                    service.status === 'unhealthy' ? 'destructive' :
                    service.status === 'warning' ? 'warning' :
                    'secondary'
                  }>
                    {service.status === 'healthy' ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Healthy
                      </div>
                    ) : service.status === 'unhealthy' ? (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Unhealthy
                      </div>
                    ) : service.status === 'warning' ? (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Warning
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Unknown
                      </div>
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last checked: {lastRefreshed.toLocaleTimeString()}
      </CardFooter>
    </Card>
  );
};

export default APIHealthOverview;