import React, { useState, useRef, useEffect } from 'react';
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
  Eye, BarChart3, BarChart4, Layers, Gem, Lightbulb, Check, Mail as MailIcon
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
      const response = await apiRequest('POST', '/api/email-validation/health-check', { email: singleEmail });
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

  const getSingleValidationStatusColor = () => {
    if (!singleValidationResult) return "bg-gray-200";
    return singleValidationResult.isValid ? "bg-green-500" : "bg-red-500";
  };

  const getHealthStatusColor = (status: boolean | undefined) => {
    if (status === undefined) return "bg-gray-200";
    return status ? "bg-green-500" : "bg-red-500";
  };

  // Mock stats for the component
  const [validationStats, setValidationStats] = useState({
    totalValidated: 254892,
    averageDeliverability: 98.7,
    duplicatesDetected: 12345,
    disposablesFiltered: 7893,
    lastUpdated: new Date().toISOString()
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="relative overflow-hidden rounded-xl p-8 md:p-10 mb-10 shadow-2xl bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "30px 30px"
            }}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-900/30 to-transparent"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 blur-xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-500/20 blur-xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600/70 backdrop-blur-sm mr-3">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-indigo-500/80 backdrop-blur-sm text-white py-1 px-3 rounded-full">
              Premium Feature
            </Badge>
          </div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-white leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">
              AI-Powered Email
            </span>
            <br />
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-200 to-indigo-300">
              Validation & Intelligence
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-indigo-100 text-base md:text-xl max-w-3xl mb-6 md:mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Maximize your email marketing ROI with advanced validation algorithms that ensure pristine email lists, 
            enhanced deliverability, and actionable intelligence for smarter campaigns.
          </motion.p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20"
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400/80 to-purple-600/80 shadow-lg">
                      <MailCheck className="h-6 w-6 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total emails validated by our system</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h3 className="text-sm text-indigo-200 font-medium">Validated</h3>
              <p className="text-white text-xl font-bold">{validationStats.totalValidated.toLocaleString()}</p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20"
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400/80 to-purple-600/80 shadow-lg">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average deliverability rate achieved</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h3 className="text-sm text-indigo-200 font-medium">Deliverability</h3>
              <p className="text-white text-xl font-bold">{validationStats.averageDeliverability}%</p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20"
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400/80 to-purple-600/80 shadow-lg">
                      <Trash2 className="h-6 w-6 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total disposable email accounts detected and filtered</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h3 className="text-sm text-indigo-200 font-medium">Disposables</h3>
              <p className="text-white text-xl font-bold">{validationStats.disposablesFiltered.toLocaleString()}</p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20"
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400/80 to-purple-600/80 shadow-lg">
                      <Copy className="h-6 w-6 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Duplicate addresses identified in lists</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <h3 className="text-sm text-indigo-200 font-medium">Duplicates</h3>
              <p className="text-white text-xl font-bold">{validationStats.duplicatesDetected.toLocaleString()}</p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <motion.div 
              className="flex items-center p-4 rounded-lg bg-indigo-800/70 backdrop-blur-sm border border-indigo-500/30 shadow-lg"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500/40 mr-4">
                <Shield className="h-5 w-5 text-indigo-200" />
              </div>
              <div>
                <h3 className="text-indigo-200 font-semibold">Advanced Protection</h3>
                <p className="text-indigo-300 text-sm">Defend against spam traps & honeypots</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center p-4 rounded-lg bg-indigo-800/70 backdrop-blur-sm border border-indigo-500/30 shadow-lg"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500/40 mr-4">
                <Zap className="h-5 w-5 text-indigo-200" />
              </div>
              <div>
                <h3 className="text-indigo-200 font-semibold">AI-Powered Fixes</h3>
                <p className="text-indigo-300 text-sm">Auto-correct typos & syntax errors</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center p-4 rounded-lg bg-indigo-800/70 backdrop-blur-sm border border-indigo-500/30 shadow-lg"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.3 }}
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500/40 mr-4">
                <Globe className="h-5 w-5 text-indigo-200" />
              </div>
              <div>
                <h3 className="text-indigo-200 font-semibold">Domain Intelligence</h3>
                <p className="text-indigo-300 text-sm">Verify MX records & domain health</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs defaultValue="single" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 rounded-xl shadow-inner">
            <TabsTrigger 
              value="single" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 ease-in-out p-0.5"
            >
              <motion.div 
                className="flex items-center py-2 px-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mr-2 flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400/80 to-purple-500/80">
                  <MailIcon className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium">Single Email Validation</span>
              </motion.div>
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 ease-in-out p-0.5"
            >
              <motion.div 
                className="flex items-center py-2 px-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mr-2 flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400/80 to-purple-500/80">
                  <Layers className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium">Bulk Email Validation</span>
              </motion.div>
            </TabsTrigger>
          </TabsList>
        
        <TabsContent value="single">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden border border-indigo-500/20 bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-900 to-purple-900 border-b border-indigo-600/30">
                <CardTitle className="text-xl text-white flex items-center">
                  <div className="mr-3 flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500/40 backdrop-blur-sm">
                    <MailIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span>Validate Individual Email</span>
                    <CardDescription className="text-indigo-200 mt-1">
                      Smart check for validity, deliverability, and domain health
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-5">
                  <div className="grid gap-3">
                    <Label htmlFor="single-email" className="text-indigo-900 font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-indigo-600" />
                      Enter email address to validate
                    </Label>
                    <div className="relative">
                      <Input
                        id="single-email"
                        placeholder="email@example.com"
                        value={singleEmail}
                        onChange={(e) => setSingleEmail(e.target.value)}
                        className="pl-10 pr-4 py-3 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm rounded-lg"
                      />
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.div className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={validateSingleEmail} 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border border-indigo-700/30 shadow-md"
                      >
                        {isLoading ? 
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 
                          <MailCheck className="h-4 w-4 mr-2" />
                        }
                        Validate Email
                      </Button>
                    </motion.div>
                    
                    <motion.div className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={checkEmailHealth} 
                        disabled={isLoading}
                        className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-sm"
                      >
                        {isLoading ? 
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 
                          <ShieldCheck className="h-4 w-4 mr-2 text-indigo-600" />
                        }
                        Deep Health Analysis
                      </Button>
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {singleValidationResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert 
                          variant={singleValidationResult.isValid ? "default" : "destructive"}
                          className={`
                            border-l-4 
                            ${singleValidationResult.isValid 
                              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-800' 
                              : 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 text-red-800'}
                          `}
                        >
                          <div className="flex items-center">
                            <div className={`
                              flex items-center justify-center h-10 w-10 rounded-full mr-3
                              ${singleValidationResult.isValid 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'}
                            `}>
                              {singleValidationResult.isValid 
                                ? <CheckCircle2 className="h-6 w-6" /> 
                                : <XCircle className="h-6 w-6" />
                              }
                            </div>
                            <div>
                              <AlertTitle className="font-bold text-base">
                                {singleValidationResult.isValid 
                                  ? "Email is valid and deliverable" 
                                  : "Email validation failed"
                                }
                              </AlertTitle>
                              <AlertDescription className="mt-1 text-sm opacity-90">
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="mt-4 overflow-hidden border border-indigo-200 shadow-lg">
                          <CardHeader className="pb-2 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
                            <CardTitle className="text-lg flex items-center text-indigo-900">
                              <div className="mr-3 flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100">
                                {singleHealthResult.isValid 
                                  ? <ShieldCheck className="h-5 w-5 text-indigo-600" /> 
                                  : <AlertTriangle className="h-5 w-5 text-amber-500" />
                                }
                              </div>
                              Email Health Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                              <motion.div 
                                className={`flex items-center p-3.5 rounded-lg border ${singleHealthResult.hasMxRecords 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-amber-50 border-amber-200'}`}
                                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                              >
                                <div className={`flex-shrink-0 mr-3 h-9 w-9 rounded-full flex items-center justify-center ${
                                  singleHealthResult.hasMxRecords
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-amber-100 text-amber-600'
                                }`}>
                                  <Globe className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">MX Records</h3>
                                  <p className={`text-sm ${singleHealthResult.hasMxRecords ? 'text-green-700' : 'text-amber-700'}`}>
                                    {singleHealthResult.hasMxRecords ? "Valid records found" : "MX records missing"}
                                  </p>
                                </div>
                              </motion.div>

                              <motion.div 
                                className={`flex items-center p-3.5 rounded-lg border ${!singleHealthResult.isDisposable 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-red-50 border-red-200'}`}
                                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                              >
                                <div className={`flex-shrink-0 mr-3 h-9 w-9 rounded-full flex items-center justify-center ${
                                  !singleHealthResult.isDisposable
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  <Shield className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">Domain Type</h3>
                                  <p className={`text-sm ${!singleHealthResult.isDisposable ? 'text-green-700' : 'text-red-700'}`}>
                                    {singleHealthResult.isDisposable ? "Disposable email detected" : "Legitimate domain"}
                                  </p>
                                </div>
                              </motion.div>

                              <motion.div 
                                className={`flex items-center p-3.5 rounded-lg border ${!singleHealthResult.isDuplicate 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-amber-50 border-amber-200'}`}
                                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                              >
                                <div className={`flex-shrink-0 mr-3 h-9 w-9 rounded-full flex items-center justify-center ${
                                  !singleHealthResult.isDuplicate
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-amber-100 text-amber-600'
                                }`}>
                                  <Copy className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">Duplicate Check</h3>
                                  <p className={`text-sm ${!singleHealthResult.isDuplicate ? 'text-green-700' : 'text-amber-700'}`}>
                                    {singleHealthResult.isDuplicate ? "Duplicate email found" : "Unique email address"}
                                  </p>
                                </div>
                              </motion.div>

                              <motion.div 
                                className={`flex items-center p-3.5 rounded-lg border ${!singleHealthResult.hasSyntaxErrors 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-red-50 border-red-200'}`}
                                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                              >
                                <div className={`flex-shrink-0 mr-3 h-9 w-9 rounded-full flex items-center justify-center ${
                                  !singleHealthResult.hasSyntaxErrors
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  <FileCheck className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">Syntax Check</h3>
                                  <p className={`text-sm ${!singleHealthResult.hasSyntaxErrors ? 'text-green-700' : 'text-red-700'}`}>
                                    {singleHealthResult.hasSyntaxErrors ? "Syntax errors detected" : "Proper email format"}
                                  </p>
                                </div>
                              </motion.div>
                            </div>
                            
                            {singleHealthResult.suggestedFix && (
                              <motion.div 
                                className="mt-5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 rounded-lg border border-indigo-200 shadow-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-3 bg-indigo-100 p-2 rounded-lg">
                                    <Wand2 className="h-5 w-5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium">AI Suggestion</h3>
                                    <p className="text-indigo-800 mt-1">
                                      Did you mean <span className="text-indigo-700 font-semibold">{singleHealthResult.suggestedFix}</span>?
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="mt-3 bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                                      onClick={() => setSingleEmail(singleHealthResult.suggestedFix || '')}
                                    >
                                      <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                                      Apply Suggestion
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                            
                            <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h3 className="text-gray-700 font-medium flex items-center mb-1">
                                <Eye className="h-4 w-4 mr-2 text-indigo-600" />
                                Detailed Analysis
                              </h3>
                              <p className="text-gray-600 text-sm">{singleHealthResult.details}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="bulk">
          <Card className="border-0 shadow-xl overflow-hidden border border-[#d4af37]/20">
            <CardHeader className="bg-gradient-to-r from-[#f5f0e1] to-[#f5f0e1]/70 border-b border-[#d4af37]/20">
              <CardTitle className="text-xl text-[#1a3a5f] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#1a3a5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
                Bulk Email Validation
              </CardTitle>
              <CardDescription className="text-[#1a3a5f]/70">
                Validate multiple email addresses at once, clean lists and fix typos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="bulk-emails" className="text-[#1a3a5f]">Email Addresses (one per line, or comma/semicolon separated)</Label>
                  <Textarea
                    id="bulk-emails"
                    placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                    className="min-h-[200px] border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-[#d4af37]/20"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={validateBulkEmails} 
                    disabled={isLoading} 
                    className="flex-1 bg-[#1a3a5f] hover:bg-[#1a3a5f]/90 text-white border border-[#d4af37]/30"
                  >
                    {isLoading ? 
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    }
                    Validate & Clean Emails
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleImportEmails} 
                    className="flex-1 border-[#d4af37]/40 text-[#1a3a5f] hover:bg-[#f5f0e1]"
                  >
                    <FileUp className="h-4 w-4 mr-2 text-[#d4af37]" />
                    Import Emails
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.csv,.json"
                    onChange={processImportedFile}
                  />
                  {bulkAnalysisResult && (
                    <>
                      <div className="flex w-full sm:w-auto">
                        <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                          <SelectTrigger className="w-[100px] rounded-r-none border-[#d4af37]/40 text-[#1a3a5f]">
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="txt">TXT</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          onClick={downloadValidEmails} 
                          className="rounded-l-none flex-1 border-[#d4af37]/40 text-[#1a3a5f] hover:bg-[#f5f0e1]"
                        >
                          <Download className="h-4 w-4 mr-2 text-[#d4af37]" />
                          Export Emails
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-[#1a3a5f]">
                      <span>Validating emails...</span>
                      <span>{processingStatus.current} / {processingStatus.total}</span>
                    </div>
                    <Progress 
                      value={(processingStatus.current / processingStatus.total) * 100} 
                      className="bg-[#f5f0e1] [&>div]:bg-[#1a3a5f]"
                    />
                  </div>
                )}
                
                {bulkAnalysisResult && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-[#f5f0e1]/50 border border-[#d4af37]/20 shadow-md overflow-hidden">
                        <CardContent className="p-4 relative">
                          <div className="flex items-center mb-1">
                            <FileTextIcon className="w-4 h-4 mr-2 text-[#1a3a5f]" />
                            <div className="text-sm text-[#1a3a5f]/70 font-medium">Total</div>
                          </div>
                          <div className="text-2xl font-bold text-[#1a3a5f]">{bulkAnalysisResult.summary.total}</div>
                          <div className="absolute top-0 right-0 h-full w-1 bg-[#1a3a5f]/10"></div>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#f5f0e1]/50 border border-[#d4af37]/20 shadow-md overflow-hidden">
                        <CardContent className="p-4 relative">
                          <div className="flex items-center mb-1">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                            <div className="text-sm text-[#1a3a5f]/70 font-medium">Valid</div>
                          </div>
                          <div className="text-2xl font-bold text-[#1a3a5f]">
                            {bulkAnalysisResult.summary.valid}
                            <span className="text-sm font-normal text-[#1a3a5f]/70 ml-2">
                              ({Math.round(bulkAnalysisResult.summary.valid / bulkAnalysisResult.summary.total * 100)}%)
                            </span>
                          </div>
                          <div className="absolute top-0 right-0 h-full w-1 bg-green-500"></div>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#f5f0e1]/50 border border-[#d4af37]/20 shadow-md overflow-hidden">
                        <CardContent className="p-4 relative">
                          <div className="flex items-center mb-1">
                            <XCircle className="w-4 h-4 mr-2 text-red-500" />
                            <div className="text-sm text-[#1a3a5f]/70 font-medium">Invalid</div>
                          </div>
                          <div className="text-2xl font-bold text-[#1a3a5f]">
                            {bulkAnalysisResult.summary.invalid}
                            <span className="text-sm font-normal text-[#1a3a5f]/70 ml-2">
                              ({Math.round(bulkAnalysisResult.summary.invalid / bulkAnalysisResult.summary.total * 100)}%)
                            </span>
                          </div>
                          <div className="absolute top-0 right-0 h-full w-1 bg-red-500"></div>
                        </CardContent>
                      </Card>
                      <Card className="bg-[#f5f0e1]/50 border border-[#d4af37]/20 shadow-md overflow-hidden">
                        <CardContent className="p-4 relative">
                          <div className="flex items-center mb-1">
                            <Copy className="w-4 h-4 mr-2 text-amber-500" />
                            <div className="text-sm text-[#1a3a5f]/70 font-medium">Duplicates</div>
                          </div>
                          <div className="text-2xl font-bold text-[#1a3a5f]">
                            {bulkAnalysisResult.summary.duplicates}
                            <span className="text-sm font-normal text-[#1a3a5f]/70 ml-2">
                              ({Math.round(bulkAnalysisResult.summary.duplicates / bulkAnalysisResult.summary.total * 100)}%)
                            </span>
                          </div>
                          <div className="absolute top-0 right-0 h-full w-1 bg-amber-500"></div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {bulkAnalysisResult.suggestedFixes.length > 0 && (
                      <Alert className="bg-[#f5f0e1]/80 border-[#d4af37]/30">
                        <Sparkles className="h-5 w-5 text-[#d4af37]" />
                        <AlertTitle className="text-[#1a3a5f] font-medium">
                          Found {bulkAnalysisResult.suggestedFixes.length} emails with possible typos
                        </AlertTitle>
                        <AlertDescription className="text-[#1a3a5f]/80">
                          <p>We detected some common email typos that can be automatically fixed.</p>
                          <Button 
                            variant="outline"
                            size="sm" 
                            className="mt-2 border-[#d4af37]/40 text-[#1a3a5f] hover:bg-[#f5f0e1] flex items-center"
                            onClick={handleFixSuggestions}
                          >
                            <Wand2 className="h-4 w-4 mr-2 text-[#d4af37]" />
                            Apply All Suggestions
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#1a3a5f]">Validation Results</h3>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowDetailedReport(!showDetailedReport)}
                            className="border-[#d4af37]/40 text-[#1a3a5f] hover:bg-[#f5f0e1]"
                          >
                            {showDetailedReport ? (
                              <><ChevronUp className="h-4 w-4 mr-2 text-[#d4af37]" />Hide Details</>
                            ) : (
                              <><ChevronDown className="h-4 w-4 mr-2 text-[#d4af37]" />Show Details</>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={downloadReport}
                            className="border-[#d4af37]/40 text-[#1a3a5f] hover:bg-[#f5f0e1]"
                          >
                            <Upload className="h-4 w-4 mr-2 text-[#d4af37]" />
                            Export Report
                          </Button>
                        </div>
                      </div>
                      
                      {showDetailedReport && (
                        <div className="space-y-4 mt-4">
                          <div>
                            <h4 className="font-medium mb-2 text-[#1a3a5f] flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-[#d4af37]" />
                              Valid Emails ({bulkAnalysisResult.validEmails.length})
                            </h4>
                            <div className="bg-[#f5f0e1]/50 p-3 rounded-lg max-h-40 overflow-y-auto border border-[#d4af37]/20">
                              {bulkAnalysisResult.validEmails.length > 0 ? (
                                <ul className="space-y-1">
                                  {bulkAnalysisResult.validEmails.map((email, index) => (
                                    <li key={index} className="text-sm font-mono text-[#1a3a5f]">{email}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-[#1a3a5f]/70">No valid emails found</p>
                              )}
                            </div>
                          </div>
                          
                          {bulkAnalysisResult.invalidEmails.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-[#1a3a5f] flex items-center">
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Invalid Emails ({bulkAnalysisResult.invalidEmails.length})
                              </h4>
                              <div className="bg-[#f5f0e1]/50 p-3 rounded-lg max-h-40 overflow-y-auto border border-[#d4af37]/20">
                                <ul className="space-y-1">
                                  {bulkAnalysisResult.invalidEmails.map((item, index) => (
                                    <li key={index} className="text-sm">
                                      <span className="font-mono text-[#1a3a5f]">{item.email}</span>
                                      <Badge variant="outline" className="ml-2 text-xs border-[#1a3a5f]/30 text-[#1a3a5f] bg-[#f5f0e1]/70">
                                        {item.reason}
                                      </Badge>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                          
                          {bulkAnalysisResult.suggestedFixes.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-[#1a3a5f] flex items-center">
                                <Sparkles className="h-4 w-4 mr-2 text-[#d4af37]" />
                                Suggested Fixes ({bulkAnalysisResult.suggestedFixes.length})
                              </h4>
                              <div className="bg-[#f5f0e1]/50 p-3 rounded-lg max-h-40 overflow-y-auto border border-[#d4af37]/20">
                                <ul className="space-y-1">
                                  {bulkAnalysisResult.suggestedFixes.map((fix, index) => (
                                    <li key={index} className="text-sm flex justify-between">
                                      <div>
                                        <span className="font-mono text-[#1a3a5f]">{fix.original}</span>
                                        <span className="mx-2 text-[#1a3a5f]/70">→</span>
                                        <span className="font-mono text-[#d4af37] font-semibold">{fix.suggestion}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  </div>
);
};

export default EmailValidation;