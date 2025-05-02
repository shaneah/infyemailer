import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, CheckCircle2, XCircle, Upload, RefreshCw, Download, 
  FileUp, FileDown, FileType, FileJson, FileText as FileTextIcon, 
  ChevronUp, ChevronDown, Sparkles, Copy, Wand2, MailCheck, 
  ShieldCheck, Zap, Shield, Mail, Globe, Trash2, FileCheck, AlertTriangle,
  Eye, BarChart3, BarChart4, Layers, Gem, Lightbulb, Check, Mail as MailIcon,
  ArrowRight, Clock, Info, Inbox, BadgeCheck, XOctagon, Search, Filter
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail?: string;
  error?: string;
}

interface EmailHealthResult {
  isValid: boolean;
  hasMxRecords: boolean;
  isDisposable: boolean;
  isDuplicate: boolean;
  hasSyntaxErrors: boolean;
  suggestedFix?: string;
  details: string;
}

interface BatchValidationResult {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  disposableCount: number;
  syntaxErrorCount: number;
  results: {
    email: string;
    isValid: boolean;
    error?: string;
    suggestedFix?: string;
  }[];
}

interface BulkAnalysisResult {
  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
    disposable: number;
    syntax: number;
  };
  validEmails: string[];
  invalidEmails: { email: string; reason: string }[];
  suggestedFixes: { original: string; suggestion: string }[];
}

const EmailValidationV2 = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('single');
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [singleValidationResult, setSingleValidationResult] = useState<EmailValidationResult | null>(null);
  const [singleHealthResult, setSingleHealthResult] = useState<EmailHealthResult | null>(null);
  const [bulkValidationResult, setBulkValidationResult] = useState<BatchValidationResult | null>(null);
  const [bulkAnalysisResult, setBulkAnalysisResult] = useState<BulkAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({ current: 0, total: 0 });
  const [exportFormat, setExportFormat] = useState<'txt'|'csv'|'json'>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationStats, setValidationStats] = useState({
    totalValidated: 254892,
    averageDeliverability: 98.7,
    disposableDetected: 1843,
    duplicatesDetected: 3721,
    spamTrapsIdentified: 142
  });

  // Fetch validation stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<any>({
    queryKey: ['/api/email-validation/stats'],
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
    // TanStack Query v5 doesn't support onSettled in options directly
    enabled: true // Always try to fetch stats
  });
  
  // Handle data updates with useEffect
  useEffect(() => {
    if (stats) {
      setValidationStats(stats);
    }
  }, [stats]);

  const validateSingleEmail = async () => {
    if (!singleEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to validate",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSingleValidationResult(null);

    try {
      const response = await apiRequest('POST', '/api/email-validation/single', { email: singleEmail });
      const result = await response.json();
      setSingleValidationResult(result);
    } catch (error) {
      console.error("Email validation error:", error);
      toast({
        title: "Validation failed",
        description: "Unable to validate email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailHealth = async () => {
    if (!singleEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to check",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSingleHealthResult(null);

    try {
      const response = await apiRequest('POST', '/api/email-validation/health', { email: singleEmail });
      const result = await response.json();
      setSingleHealthResult(result);
    } catch (error) {
      console.error("Email health check error:", error);
      toast({
        title: "Health check failed",
        description: "Unable to check email health. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateBulkEmails = async () => {
    const emails = bulkEmails.trim().split(/[\s,;]+/).filter(Boolean);
    
    if (emails.length === 0) {
      toast({
        title: "No emails found",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setBulkValidationResult(null);
    setBulkAnalysisResult(null);
    setProcessingStatus({ current: 0, total: emails.length });

    const simulateProgress = () => {
      setProcessingStatus(prev => ({
        ...prev,
        current: Math.min(prev.current + Math.ceil(emails.length / 20), emails.length)
      }));
    };

    const progressInterval = setInterval(simulateProgress, 100);

    try {
      const response = await apiRequest('POST', '/api/email-validation/bulk', { emails });
      clearInterval(progressInterval);
      setProcessingStatus({ current: emails.length, total: emails.length });
      
      const result = await response.json();
      setBulkValidationResult(result);

      // Generate analysis report
      const analysis: BulkAnalysisResult = {
        summary: {
          total: emails.length,
          valid: result.validCount,
          invalid: result.invalidCount,
          duplicates: result.duplicateCount || 0,
          disposable: result.disposableCount || 0,
          syntax: result.syntaxErrorCount || 0
        },
        validEmails: result.results.filter((r: any) => r.isValid).map((r: any) => r.email),
        invalidEmails: result.results.filter((r: any) => !r.isValid).map((r: any) => ({ 
          email: r.email, 
          reason: r.error || "Unknown error" 
        })),
        suggestedFixes: result.results
          .filter((r: any) => r.suggestedFix)
          .map((r: any) => ({ original: r.email, suggestion: r.suggestedFix }))
      };
      
      setBulkAnalysisResult(analysis);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Bulk validation error:", error);
      toast({
        title: "Bulk validation failed",
        description: "Unable to validate emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkEmails(content || '');
    };
    reader.readAsText(file);
  };

  const downloadReport = () => {
    if (!bulkAnalysisResult) return;
    
    let reportContent = '';
    let mimeType = 'text/plain';
    let fileExtension = 'txt';
    
    if (exportFormat === 'json') {
      reportContent = JSON.stringify(bulkAnalysisResult, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else if (exportFormat === 'csv') {
      const header = 'Email,Status,Reason,Suggested Fix\n';
      const validRows = bulkAnalysisResult.validEmails.map(email => 
        `${email},Valid,,`
      );
      
      const invalidRows = bulkAnalysisResult.invalidEmails.map(({ email, reason }) => {
        const suggestedFix = bulkAnalysisResult.suggestedFixes.find(fix => fix.original === email)?.suggestion || '';
        return `${email},Invalid,"${reason.replace(/"/g, '""')}","${suggestedFix.replace(/"/g, '""')}"`;
      });
      
      reportContent = header + [...validRows, ...invalidRows].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else {
      reportContent = [
        '# Email Validation Report',
        `Date: ${new Date().toLocaleString()}`,
        '',
        '## Summary',
        `Total emails processed: ${bulkAnalysisResult.summary.total}`,
        `Valid emails: ${bulkAnalysisResult.summary.valid} (${Math.round(bulkAnalysisResult.summary.valid / bulkAnalysisResult.summary.total * 100)}%)`,
        `Invalid emails: ${bulkAnalysisResult.summary.invalid} (${Math.round(bulkAnalysisResult.summary.invalid / bulkAnalysisResult.summary.total * 100)}%)`,
        `Duplicates: ${bulkAnalysisResult.summary.duplicates} (${Math.round(bulkAnalysisResult.summary.duplicates / bulkAnalysisResult.summary.total * 100)}%)`,
        `Disposable emails: ${bulkAnalysisResult.summary.disposable} (${Math.round(bulkAnalysisResult.summary.disposable / bulkAnalysisResult.summary.total * 100)}%)`,
        `Syntax errors: ${bulkAnalysisResult.summary.syntax} (${Math.round(bulkAnalysisResult.summary.syntax / bulkAnalysisResult.summary.total * 100)}%)`,
        '',
        '## Valid Emails',
        ...bulkAnalysisResult.validEmails,
        '',
        '## Invalid Emails',
        ...bulkAnalysisResult.invalidEmails.map(({ email, reason }) => `${email} - ${reason}`),
        '',
        '## Suggested Fixes',
        ...bulkAnalysisResult.suggestedFixes.map(({ original, suggestion }) => `${original} → ${suggestion}`)
      ].join('\n');
    }
    
    const blob = new Blob([reportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_validation_report.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSingleValidationStatusColor = () => {
    if (!singleValidationResult) return "bg-gray-200";
    return singleValidationResult.isValid ? "bg-green-500" : "bg-red-500";
  };

  const getHealthStatusColor = (status: boolean | undefined) => {
    if (status === undefined) return "bg-gray-200";
    return status ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
          Email Validation & Verification
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Validate email addresses, check deliverability, and clean your email lists with our powerful validation tools. 
          Reduce bounce rates and improve email campaign performance.
        </p>
      </motion.div>

      {/* Stats Overview Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-md shadow-purple-100/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-500 flex items-center">
              <MailCheck className="h-4 w-4 mr-2 text-purple-400" />
              Total Validated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">{isLoadingStats ? 
              <Skeleton className="h-8 w-24" /> : 
              validationStats.totalValidated.toLocaleString()
            }</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-md shadow-blue-100/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500 flex items-center">
              <BadgeCheck className="h-4 w-4 mr-2 text-blue-400" />
              Deliverability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">{isLoadingStats ? 
              <Skeleton className="h-8 w-16" /> : 
              `${validationStats.averageDeliverability}%`
            }</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-md shadow-green-100/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500 flex items-center">
              <Trash2 className="h-4 w-4 mr-2 text-green-400" />
              Disposable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">{isLoadingStats ? 
              <Skeleton className="h-8 w-16" /> : 
              validationStats.disposableDetected.toLocaleString()
            }</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-md shadow-amber-100/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-500 flex items-center">
              <Copy className="h-4 w-4 mr-2 text-amber-400" />
              Duplicates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">{isLoadingStats ? 
              <Skeleton className="h-8 w-16" /> : 
              validationStats.duplicatesDetected.toLocaleString()
            }</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-md shadow-red-100/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-red-400" />
              Spam Traps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-800">{isLoadingStats ? 
              <Skeleton className="h-8 w-16" /> : 
              validationStats.spamTrapsIdentified.toLocaleString()
            }</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Highlight */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Advanced Protection</h3>
                <p className="text-gray-600 text-sm">Identify spam traps, honeypots, and avoid deliverability issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Fixes</h3>
                <p className="text-gray-600 text-sm">Automatically correct typos, syntax errors and domain misspellings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Domain Intelligence</h3>
                <p className="text-gray-600 text-sm">Check MX records, domain reputation and email server health</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Validation Tabs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
            <TabsTrigger value="single" className="rounded-lg">
              <Mail className="h-4 w-4 mr-2" />
              Single Email
            </TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-lg">
              <Inbox className="h-4 w-4 mr-2" />
              Bulk Validation
            </TabsTrigger>
          </TabsList>
          
          {/* Single Email Validation */}
          <TabsContent value="single" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Single Email Validation
                </CardTitle>
                <CardDescription>
                  Validate a single email address with detailed analysis and health check
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="singleEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="singleEmail"
                        placeholder="example@domain.com" 
                        value={singleEmail} 
                        onChange={(e) => setSingleEmail(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && validateSingleEmail()}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={validateSingleEmail} 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Validating...</>
                      ) : (
                        <><MailCheck className="h-4 w-4 mr-2" /> Validate</>
                      )}
                    </Button>
                    <Button 
                      onClick={checkEmailHealth} 
                      variant="outline" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
                      ) : (
                        <><Shield className="h-4 w-4 mr-2" /> Health Check</>
                      )}
                    </Button>
                  </div>
                </div>
                
                {singleValidationResult && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-3">Validation Results</h3>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            singleValidationResult.isValid 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {singleValidationResult.isValid 
                              ? <CheckCircle2 className="h-5 w-5" /> 
                              : <XCircle className="h-5 w-5" />
                            }
                          </div>
                          <div className="ml-3">
                            <div className="font-semibold">
                              {singleValidationResult.isValid ? "Valid Email" : "Invalid Email"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {singleValidationResult.isValid 
                                ? "This email appears to be valid and deliverable" 
                                : "This email is invalid or undeliverable"
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:ml-auto">
                          {singleValidationResult.normalizedEmail && singleValidationResult.normalizedEmail !== singleEmail && (
                            <div className="flex items-center text-sm">
                              <Badge variant="outline" className="font-normal">
                                <Wand2 className="h-3 w-3 mr-1" />
                                Normalized: {singleValidationResult.normalizedEmail}
                              </Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0 ml-1"
                                      onClick={() => {
                                        navigator.clipboard.writeText(singleValidationResult.normalizedEmail || "");
                                        toast({
                                          title: "Copied",
                                          description: "Email address copied to clipboard",
                                        });
                                      }}
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy normalized email</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!singleValidationResult.isValid && singleValidationResult.error && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Validation Error</AlertTitle>
                          <AlertDescription>
                            {singleValidationResult.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {singleHealthResult && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-3">Health Assessment</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2">
                            <Globe className="h-5 w-5 text-gray-600" />
                          </div>
                          <CardTitle className="text-sm">MX Records</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center">
                            <div className={`h-2.5 w-2.5 rounded-full ${
                              singleHealthResult.hasMxRecords 
                                ? "bg-green-500" 
                                : "bg-red-500"
                            } mr-2`}></div>
                            <span className="text-sm font-medium">
                              {singleHealthResult.hasMxRecords ? "Valid" : "Invalid"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2">
                            <Trash2 className="h-5 w-5 text-gray-600" />
                          </div>
                          <CardTitle className="text-sm">Disposable Email</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center">
                            <div className={`h-2.5 w-2.5 rounded-full ${
                              !singleHealthResult.isDisposable 
                                ? "bg-green-500" 
                                : "bg-red-500"
                            } mr-2`}></div>
                            <span className="text-sm font-medium">
                              {singleHealthResult.isDisposable ? "Yes" : "No"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2">
                            <FileCheck className="h-5 w-5 text-gray-600" />
                          </div>
                          <CardTitle className="text-sm">Syntax</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center">
                            <div className={`h-2.5 w-2.5 rounded-full ${
                              !singleHealthResult.hasSyntaxErrors 
                                ? "bg-green-500" 
                                : "bg-red-500"
                            } mr-2`}></div>
                            <span className="text-sm font-medium">
                              {singleHealthResult.hasSyntaxErrors ? "Errors" : "Valid"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {singleHealthResult.suggestedFix && (
                      <Alert className="mt-4 bg-blue-50 border border-blue-200">
                        <Wand2 className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-700">Suggested Fix</AlertTitle>
                        <AlertDescription className="text-blue-800">
                          Did you mean <strong>{singleHealthResult.suggestedFix}</strong>?
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {singleHealthResult.details && (
                      <div className="mt-4 p-4 rounded-lg border bg-gray-50">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-1.5" /> Detailed Assessment
                        </h4>
                        <p className="text-sm text-gray-600">{singleHealthResult.details}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bulk Email Validation */}
          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Bulk Email Validation
                </CardTitle>
                <CardDescription>
                  Validate multiple email addresses and get a comprehensive analysis report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="bulkEmails">Enter emails (one per line or comma separated)</Label>
                  <Textarea 
                    id="bulkEmails"
                    placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com" 
                    value={bulkEmails} 
                    onChange={(e) => setBulkEmails(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import from File
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".txt,.csv,.json"
                    />
                  </Button>
                  
                  <Button 
                    onClick={validateBulkEmails} 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 sm:ml-auto w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><MailCheck className="h-4 w-4 mr-2" /> Validate Emails</>
                    )}
                  </Button>
                </div>
                
                {isLoading && processingStatus.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Validating emails...</span>
                      <span>{Math.round((processingStatus.current / processingStatus.total) * 100)}%</span>
                    </div>
                    <Progress value={(processingStatus.current / processingStatus.total) * 100} className="h-2" />
                  </div>
                )}
                
                {bulkValidationResult && (
                  <motion.div 
                    className="pt-4 space-y-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                      <h3 className="text-lg font-semibold">Validation Results</h3>
                      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                        <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Export format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">CSV Format</SelectItem>
                            <SelectItem value="json">JSON Format</SelectItem>
                            <SelectItem value="txt">Text Format</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="outline" 
                          onClick={downloadReport}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Card className="bg-gray-50 border border-gray-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold mb-1">
                            {bulkValidationResult.results.length}
                          </div>
                          <p className="text-gray-500 text-sm">Total Emails</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-50 border border-green-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-green-700 mb-1">
                            {bulkValidationResult.validCount}
                          </div>
                          <p className="text-green-600 text-sm">Valid Emails</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-red-50 border border-red-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl font-bold text-red-700 mb-1">
                            {bulkValidationResult.invalidCount}
                          </div>
                          <p className="text-red-600 text-sm">Invalid Emails</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Card className="border-amber-200">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center">
                            <Copy className="h-4 w-4 mr-2 text-amber-500" />
                            Duplicates
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <p className="text-2xl font-bold">
                            {bulkValidationResult.duplicateCount || 0}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-purple-200">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center">
                            <Trash2 className="h-4 w-4 mr-2 text-purple-500" />
                            Disposable
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <p className="text-2xl font-bold">
                            {bulkValidationResult.disposableCount || 0}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-orange-200">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                            Syntax Errors
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <p className="text-2xl font-bold">
                            {bulkValidationResult.syntaxErrorCount || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      variant="link" 
                      onClick={() => setShowDetailedReport(!showDetailedReport)}
                      className="text-purple-600 hover:text-purple-700 p-0 h-auto"
                    >
                      {showDetailedReport ? (
                        <><ChevronUp className="h-4 w-4 mr-1" /> Hide Detailed Report</>
                      ) : (
                        <><ChevronDown className="h-4 w-4 mr-1" /> Show Detailed Report</>
                      )}
                    </Button>
                    
                    {showDetailedReport && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border rounded-lg overflow-hidden"
                      >
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="w-[40%]">Email</TableHead>
                              <TableHead className="w-[15%]">Status</TableHead>
                              <TableHead className="w-[45%]">Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bulkValidationResult.results.slice(0, 100).map((result, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono text-sm">
                                  {result.email}
                                </TableCell>
                                <TableCell>
                                  {result.isValid ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                                      <Check className="h-3 w-3 mr-1" />
                                      Valid
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
                                      <XOctagon className="h-3 w-3 mr-1" />
                                      Invalid
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  {result.error && (
                                    <div className="text-red-600">{result.error}</div>
                                  )}
                                  {result.suggestedFix && (
                                    <div className="text-blue-600 mt-1">
                                      <span className="font-medium">Suggestion:</span> {result.suggestedFix}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {bulkValidationResult.results.length > 100 && (
                          <div className="p-3 text-center text-sm text-gray-500 bg-gray-50 border-t">
                            Showing 100 of {bulkValidationResult.results.length} results. Export the report to see all data.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default EmailValidationV2;