import React, { useState, useRef } from 'react';
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
  Network, Send, Scan, Radar, Orbit, ServerCrash, MoveUpRight, Filter, 
  BadgeCheck, Verified, ThumbsUp, ArrowUpRight, ChevronRight, 
  Heart, CheckCircle, Clock, BarChart, Database, TrendingUp, CloudOff, Activity
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  totalProcessed: number;
  validEmails: string[];
  invalidEmails: {email: string, reason: string}[];
  duplicateEmails: string[];
}

interface BulkAnalysisResult {
  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
    disposable: number;
    syntax: number;
    mxIssues: number;
  };
  validEmails: string[];
  invalidEmails: {email: string, reason: string}[];
  suggestedFixes: {original: string, suggestion: string}[];
}

const EmailValidation = () => {
  const { toast } = useToast();
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [singleValidationResult, setSingleValidationResult] = useState<EmailValidationResult | null>(null);
  const [singleHealthResult, setSingleHealthResult] = useState<EmailHealthResult | null>(null);
  const [bulkValidationResult, setBulkValidationResult] = useState<BatchValidationResult | null>(null);
  const [bulkAnalysisResult, setBulkAnalysisResult] = useState<BulkAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({ current: 0, total: 0 });
  const [exportFormat, setExportFormat] = useState<'txt'|'csv'|'json'>('txt');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setSingleHealthResult(null);

    try {
      const response = await apiRequest('POST', '/api/email-validation/single', { email: singleEmail });
      const result = await response.json();
      setSingleValidationResult(result);
      
      // Automatically run health check as well
      try {
        const healthResponse = await apiRequest('POST', '/api/email-validation/health-check', { email: singleEmail });
        const healthResult = await healthResponse.json();
        setSingleHealthResult(healthResult);
      } catch (error) {
        console.error("Email health check error:", error);
      }
      
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

  const validateBulkEmails = async () => {
    if (!bulkEmails.trim()) {
      toast({
        title: "Emails required",
        description: "Please enter emails to validate",
        variant: "destructive"
      });
      return;
    }

    const emailList = bulkEmails
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setBulkValidationResult(null);
    setBulkAnalysisResult(null);
    setProcessingStatus({ current: 0, total: emailList.length });

    try {
      // Simulated progress updates
      const progressInterval = setInterval(() => {
        setProcessingStatus(prev => ({
          ...prev,
          current: Math.min(prev.current + Math.floor(Math.random() * 5) + 1, prev.total)
        }));
      }, 100);

      // Analyze the bulk emails
      const response = await apiRequest('POST', '/api/email-validation/analyze-bulk', { emails: emailList });
      const result = await response.json();
      
      clearInterval(progressInterval);
      setProcessingStatus({ current: emailList.length, total: emailList.length });
      
      setBulkAnalysisResult(result);
    } catch (error) {
      console.error("Bulk validation error:", error);
      toast({
        title: "Validation failed",
        description: "Unable to validate emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixSuggestions = () => {
    if (!bulkAnalysisResult || bulkAnalysisResult.suggestedFixes.length === 0) return;
    
    // Create a map of original emails to suggested fixes
    const fixMap = new Map<string, string>();
    bulkAnalysisResult.suggestedFixes.forEach(({ original, suggestion }) => {
      fixMap.set(original, suggestion);
    });
    
    // Update the bulk emails input with the fixes
    const updatedEmails = bulkEmails
      .split(/[\n,;]/)
      .map(email => {
        const trimmedEmail = email.trim();
        return fixMap.has(trimmedEmail) ? fixMap.get(trimmedEmail) : trimmedEmail;
      })
      .join('\n');
    
    setBulkEmails(updatedEmails);
    
    toast({
      title: "Suggestions applied",
      description: `Applied ${bulkAnalysisResult.suggestedFixes.length} email suggestions`,
    });
  };

  const handleImportEmails = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const processImportedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setBulkEmails(content);
        toast({
          title: "File imported",
          description: `Successfully imported ${file.name}`,
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
    
    // Reset the input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const downloadValidEmails = () => {
    if (!bulkAnalysisResult || bulkAnalysisResult.validEmails.length === 0) return;
    
    let content = '';
    let fileName = '';
    let mimeType = '';
    
    if (exportFormat === 'csv') {
      content = 'Email Address\n' + bulkAnalysisResult.validEmails.join('\n');
      fileName = 'valid_emails.csv';
      mimeType = 'text/csv';
    } else if (exportFormat === 'json') {
      content = JSON.stringify(bulkAnalysisResult.validEmails, null, 2);
      fileName = 'valid_emails.json';
      mimeType = 'application/json';
    } else {
      // Default to txt
      content = bulkAnalysisResult.validEmails.join('\n');
      fileName = 'valid_emails.txt';
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    if (!bulkAnalysisResult) return;
    
    const reportContent = [
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
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email_validation_report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Mock stats for the component
  const validationStats = {
    totalValidated: 254892,
    averageDeliverability: 98.7,
    duplicatesDetected: 12345,
    disposablesFiltered: 7893,
    lastUpdated: new Date().toISOString()
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modern, Teal/Blue/Green themed header */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl p-8 md:p-10 mb-8 shadow-lg bg-gradient-to-r from-teal-600 to-emerald-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-300/20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-64 rounded-full bg-gradient-to-tr from-emerald-300/20 to-teal-400/20 blur-xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/80 mr-3 shadow-md">
              <MailCheck className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-emerald-500/80 text-white py-1 px-3 rounded-full text-xs">
              Smart Email Tools
            </Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white leading-tight">
            Email Validation Center
            <span className="block text-lg font-normal text-emerald-50/90 mt-1">
              Verify email addresses with professional tools
            </span>
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-2">
                  <CheckCircle className="h-4 w-4 text-emerald-50" />
                </div>
                <p className="text-xs font-medium text-emerald-50 uppercase tracking-wide">Accuracy</p>
              </div>
              <p className="text-2xl font-bold text-white">{validationStats.averageDeliverability}%</p>
              <div className="mt-2 flex items-center">
                <div className="h-1.5 bg-emerald-200/20 rounded-full w-full">
                  <div 
                    className="h-1.5 bg-emerald-300 rounded-full" 
                    style={{ width: `${validationStats.averageDeliverability}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-2">
                  <Mail className="h-4 w-4 text-emerald-50" />
                </div>
                <p className="text-xs font-medium text-emerald-50 uppercase tracking-wide">Processed</p>
              </div>
              <p className="text-2xl font-bold text-white">{(validationStats.totalValidated / 1000).toFixed(0)}k</p>
              <p className="text-xs text-emerald-100/80 mt-1">Total emails verified</p>
            </div>
            
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-2">
                  <Filter className="h-4 w-4 text-emerald-50" />
                </div>
                <p className="text-xs font-medium text-emerald-50 uppercase tracking-wide">Filtered</p>
              </div>
              <p className="text-2xl font-bold text-white">{(validationStats.disposablesFiltered / 1000).toFixed(1)}k</p>
              <p className="text-xs text-emerald-100/80 mt-1">Temporary addresses</p>
            </div>
            
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-2">
                  <Globe className="h-4 w-4 text-emerald-50" />
                </div>
                <p className="text-xs font-medium text-emerald-50 uppercase tracking-wide">Domains</p>
              </div>
              <p className="text-2xl font-bold text-white">5.2k+</p>
              <p className="text-xs text-emerald-100/80 mt-1">Verified domains</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Main content with tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="single" className="mb-8">
          <TabsList className="w-full grid grid-cols-2 bg-gray-100/80 p-1 rounded-lg mb-6">
            <TabsTrigger 
              value="single" 
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md text-gray-600 transition-all duration-200"
            >
              <div className="flex items-center py-2 px-3">
                <Mail className="h-4 w-4 mr-2" />
                <span className="font-medium">Single Email</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md text-gray-600 transition-all duration-200"
            >
              <div className="flex items-center py-2 px-3">
                <Layers className="h-4 w-4 mr-2" />
                <span className="font-medium">Bulk Validation</span>
              </div>
            </TabsTrigger>
          </TabsList>
        
          {/* Single Email Tab */}
          <TabsContent value="single">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-gray-200 shadow-md bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 pb-4">
                  <CardTitle className="text-lg text-emerald-800 flex items-center">
                    <div className="mr-3 flex items-center justify-center h-8 w-8 rounded-md bg-emerald-600 shadow-sm">
                      <MailCheck className="h-4 w-4 text-white" />
                    </div>
                    Verify Single Email
                  </CardTitle>
                  <CardDescription className="text-emerald-700 mt-1">
                    Check an individual email address for validity and deliverability
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="single-email" className="text-sm font-medium">Email Address</Label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="single-email"
                            type="email"
                            placeholder="Enter email to validate"
                            value={singleEmail}
                            onChange={(e) => setSingleEmail(e.target.value)}
                            className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </div>
                        <Button 
                          onClick={validateSingleEmail} 
                          disabled={isLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Scan className="h-4 w-4 mr-2" />
                              Verify Email
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        We'll check syntax, domain records, and mailbox existence
                      </p>
                    </div>
                    
                    {/* Single email validation results */}
                    <AnimatePresence>
                      {singleValidationResult && (
                        <motion.div
                          key="single-validation-result"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Alert className={`
                            border-l-4 shadow-sm
                            ${singleValidationResult.isValid ? 'border-l-emerald-500 bg-emerald-50' : 'border-l-red-500 bg-red-50'}
                          `}>
                            <div className="flex gap-3">
                              <div className={`
                                flex items-center justify-center h-10 w-10 rounded-full shadow-sm
                                ${singleValidationResult.isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}
                              `}>
                                {singleValidationResult.isValid 
                                  ? <CheckCircle2 className="h-5 w-5" /> 
                                  : <XCircle className="h-5 w-5" />
                                }
                              </div>
                              <div>
                                <AlertTitle className="font-bold text-base">
                                  {singleValidationResult.isValid 
                                    ? "Email is valid and deliverable" 
                                    : "Email validation failed"
                                  }
                                </AlertTitle>
                                <AlertDescription className="mt-1 text-sm">
                                  {singleValidationResult.isValid 
                                    ? `Normalized: ${singleValidationResult.normalizedEmail}` 
                                    : singleValidationResult.error
                                  }
                                </AlertDescription>
                              </div>
                            </div>
                          </Alert>
                        </motion.div>
                      )}
                      
                      {singleHealthResult && (
                        <motion.div
                          key="single-health-result"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="mt-4"
                        >
                          <Card className="border border-gray-200">
                            <CardHeader className="py-4 px-5">
                              <CardTitle className="text-base flex items-center">
                                <div className="mr-2 p-1.5 rounded-full bg-emerald-100">
                                  <Activity className="h-4 w-4 text-emerald-600" />
                                </div>
                                Email Health Report
                              </CardTitle>
                            </CardHeader>
                            <div className="px-5 pb-5">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">MX Records</span>
                                    <Badge className={singleHealthResult.hasMxRecords ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                                      {singleHealthResult.hasMxRecords ? "Valid" : "Missing"}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Disposable Email</span>
                                    <Badge className={!singleHealthResult.isDisposable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                                      {!singleHealthResult.isDisposable ? "No" : "Yes"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Syntax</span>
                                    <Badge className={!singleHealthResult.hasSyntaxErrors ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                                      {!singleHealthResult.hasSyntaxErrors ? "Valid" : "Issues"}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Duplicate</span>
                                    <Badge className={!singleHealthResult.isDuplicate ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                                      {!singleHealthResult.isDuplicate ? "No" : "Yes"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              {singleHealthResult.suggestedFix && (
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-amber-800">Suggested Fix</p>
                                      <p className="text-sm text-amber-700">{singleHealthResult.suggestedFix}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-4 text-sm text-gray-600">
                                <p>
                                  {singleHealthResult.details}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        
          {/* Bulk Email Tab */}
          <TabsContent value="bulk">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-gray-200 shadow-md bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 pb-4">
                  <CardTitle className="text-lg text-emerald-800 flex items-center">
                    <div className="mr-3 flex items-center justify-center h-8 w-8 rounded-md bg-emerald-600 shadow-sm">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                    Bulk Email Validation
                  </CardTitle>
                  <CardDescription className="text-emerald-700 mt-1">
                    Verify multiple email addresses at once and analyze your list quality
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="bulk-emails" className="text-sm font-medium">Email Addresses</Label>
                        <div className="text-xs text-gray-500">
                          One email per line or separated by commas
                        </div>
                      </div>
                      
                      <Textarea
                        id="bulk-emails"
                        placeholder="Enter or paste multiple email addresses..."
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        rows={6}
                        className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleImportEmails}
                          className="text-xs flex items-center border-gray-200 text-gray-700"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Import File
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".txt,.csv"
                          className="hidden"
                          onChange={processImportedFile}
                        />
                      </div>
                    </div>
                    
                    {isLoading && processingStatus.total > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Processing emails...</span>
                          <span>{processingStatus.current} of {processingStatus.total}</span>
                        </div>
                        <Progress value={(processingStatus.current / processingStatus.total) * 100} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={validateBulkEmails} 
                        disabled={isLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <Scan className="h-4 w-4 mr-2" />
                            Validate All Emails
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Bulk validation results */}
                    <AnimatePresence>
                      {bulkAnalysisResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-6"
                        >
                          <Card className="border border-gray-200">
                            <CardHeader className="py-4 px-5 bg-gray-50 border-b">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base flex items-center">
                                  <BarChart className="h-4 w-4 mr-2 text-emerald-600" />
                                  Validation Results
                                </CardTitle>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setShowDetailedReport(!showDetailedReport)}
                                  >
                                    {showDetailedReport ? (
                                      <>
                                        <ChevronUp className="h-3 w-3 mr-1" />
                                        Hide Details
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3 w-3 mr-1" />
                                        Show Details
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <div className="p-5">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                                  <div className="text-xs text-gray-500 mb-1">Total Processed</div>
                                  <div className="text-2xl font-bold text-gray-800">
                                    {bulkAnalysisResult.summary.total}
                                  </div>
                                </div>
                                
                                <div className="bg-emerald-50 rounded-md p-3 border border-emerald-100">
                                  <div className="text-xs text-emerald-600 mb-1">Valid Emails</div>
                                  <div className="text-2xl font-bold text-emerald-700">
                                    {bulkAnalysisResult.summary.valid} 
                                    <span className="text-sm font-normal ml-1 text-emerald-600">
                                      ({Math.round(bulkAnalysisResult.summary.valid / bulkAnalysisResult.summary.total * 100)}%)
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="bg-red-50 rounded-md p-3 border border-red-100">
                                  <div className="text-xs text-red-600 mb-1">Invalid Emails</div>
                                  <div className="text-2xl font-bold text-red-700">
                                    {bulkAnalysisResult.summary.invalid}
                                    <span className="text-sm font-normal ml-1 text-red-600">
                                      ({Math.round(bulkAnalysisResult.summary.invalid / bulkAnalysisResult.summary.total * 100)}%)
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="bg-amber-50 rounded-md p-3 border border-amber-100">
                                  <div className="text-xs text-amber-600 mb-1">Duplicate Emails</div>
                                  <div className="text-2xl font-bold text-amber-700">
                                    {bulkAnalysisResult.summary.duplicates}
                                    <span className="text-sm font-normal ml-1 text-amber-600">
                                      ({Math.round(bulkAnalysisResult.summary.duplicates / bulkAnalysisResult.summary.total * 100)}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                  <div className="flex gap-2 items-center">
                                    <Shield className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium">List Health Score</span>
                                  </div>
                                  <Badge className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-md">
                                    {Math.round(bulkAnalysisResult.summary.valid / bulkAnalysisResult.summary.total * 100)}%
                                  </Badge>
                                </div>
                                
                                <Progress 
                                  value={Math.round(bulkAnalysisResult.summary.valid / bulkAnalysisResult.summary.total * 100)} 
                                  className="h-2.5 bg-gray-100"
                                />
                                
                                <div className="grid grid-cols-3 text-xs text-gray-500 pt-1">
                                  <div>Poor (0-60%)</div>
                                  <div className="text-center">Good (60-90%)</div>
                                  <div className="text-right">Excellent (90-100%)</div>
                                </div>
                              </div>
                              
                              {bulkAnalysisResult.suggestedFixes.length > 0 && (
                                <div className="bg-amber-50 rounded-md p-4 border border-amber-200 mb-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-amber-100">
                                      <Wand2 className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-amber-800">
                                        {bulkAnalysisResult.suggestedFixes.length} Potential Fixes Found
                                      </h4>
                                      <p className="text-xs text-amber-700 mt-1 mb-3">
                                        We've detected some emails with potential issues that can be fixed automatically.
                                      </p>
                                      <Button
                                        size="sm"
                                        onClick={handleFixSuggestions}
                                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                                      >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Apply Suggestions
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Detailed report */}
                              <AnimatePresence>
                                {showDetailedReport && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border border-gray-200 rounded-md mt-6 overflow-hidden"
                                  >
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                      <h4 className="font-medium text-sm text-gray-700">Detailed Validation Report</h4>
                                      <div className="flex gap-2">
                                        <div className="flex items-center gap-1.5">
                                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                          <span className="text-xs">Valid</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                          <span className="text-xs">Invalid</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                          <span className="text-xs">Duplicates</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="max-h-[300px] overflow-auto p-4">
                                      <div className="space-y-6">
                                        {bulkAnalysisResult.validEmails.length > 0 && (
                                          <div>
                                            <h5 className="text-sm font-medium text-emerald-800 mb-2 flex items-center">
                                              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                                              Valid Emails ({bulkAnalysisResult.validEmails.length})
                                            </h5>
                                            <div className="bg-gray-50 p-2 rounded-md max-h-[120px] overflow-auto border border-gray-100">
                                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                {bulkAnalysisResult.validEmails.map((email, index) => (
                                                  <div key={`valid-${index}`} className="text-xs text-gray-700 bg-emerald-50 rounded px-2 py-1 border border-emerald-100 flex items-center">
                                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-1.5"></div>
                                                    <span className="truncate">{email}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {bulkAnalysisResult.invalidEmails.length > 0 && (
                                          <div>
                                            <h5 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                                              <AlertCircle className="h-4 w-4 mr-1.5 text-red-600" />
                                              Invalid Emails ({bulkAnalysisResult.invalidEmails.length})
                                            </h5>
                                            <div className="space-y-1.5 max-h-[150px] overflow-auto">
                                              {bulkAnalysisResult.invalidEmails.map(({ email, reason }, index) => (
                                                <div key={`invalid-${index}`} className="text-xs bg-red-50 rounded px-3 py-2 border border-red-100">
                                                  <div className="font-medium text-red-800 mb-0.5">{email}</div>
                                                  <div className="text-red-600">{reason}</div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {bulkAnalysisResult.suggestedFixes.length > 0 && (
                                          <div>
                                            <h5 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                                              <Wand2 className="h-4 w-4 mr-1.5 text-amber-600" />
                                              Suggested Fixes ({bulkAnalysisResult.suggestedFixes.length})
                                            </h5>
                                            <div className="space-y-1.5 max-h-[150px] overflow-auto">
                                              {bulkAnalysisResult.suggestedFixes.map(({ original, suggestion }, index) => (
                                                <div key={`fix-${index}`} className="text-xs bg-amber-50 rounded px-3 py-2 border border-amber-100 flex items-center gap-2">
                                                  <div className="text-amber-800 line-through">{original}</div>
                                                  <ArrowUpRight className="h-3 w-3 text-amber-600" />
                                                  <div className="text-emerald-700 font-medium">{suggestion}</div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              
                              <div className="flex flex-wrap gap-3 mt-6">
                                <div className="flex-1 min-w-[180px]">
                                  <div className="flex gap-2 mb-2">
                                    <Label htmlFor="export-format" className="text-xs">Export Format</Label>
                                  </div>
                                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="txt">Text File (.txt)</SelectItem>
                                      <SelectItem value="csv">CSV File (.csv)</SelectItem>
                                      <SelectItem value="json">JSON File (.json)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex gap-2 flex-1 min-w-[180px]">
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    onClick={downloadValidEmails}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Valid Emails
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                                    onClick={downloadReport}
                                  >
                                    <FileTextIcon className="h-4 w-4 mr-2" />
                                    Full Report
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default EmailValidation;