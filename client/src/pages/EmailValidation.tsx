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
  Eye, BarChart3, BarChart4, Layers, Gem, Lightbulb, Check, Mail as MailIcon, X
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
        className="relative overflow-hidden rounded-xl p-8 md:p-10 mb-10 shadow-2xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500"
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
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-pink-600/30 to-transparent"></div>
          
          {/* Animated circles */}
          <motion.div 
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400/30 to-pink-600/30 blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          ></motion.div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 mr-3">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-1.5 px-4 rounded-full shadow-md shadow-blue-500/20">
              Premium Feature
            </Badge>
          </div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-white leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-200 to-white">
              Intelligent Email
            </span>
            <div className="relative inline-block mt-2">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-rose-200 to-purple-300">
                Validation & Analytics
              </span>
              <motion.div 
                className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 rounded-full"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
          </motion.h1>
          
          <motion.p 
            className="text-white text-base md:text-xl max-w-3xl mb-6 md:mb-8 leading-relaxed"
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
          <div className="bg-gradient-to-r from-blue-900/90 via-indigo-800/90 to-purple-900/90 rounded-xl shadow-xl p-2 border border-indigo-600/20">
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent backdrop-blur-xl">
              <div>
                <TabsTrigger 
                  value="single" 
                  className="w-full data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-indigo-100 hover:bg-white/5 rounded-lg transition-all duration-200 ease-out p-0.5"
                >
                  <div className="flex items-center py-2 px-2">
                    <div className="mr-2 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400/80 to-blue-500/80 shadow-md shadow-blue-500/20">
                      <MailIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Single Email Validation</span>
                  </div>
                </TabsTrigger>
              </div>
              <div>
                <TabsTrigger 
                  value="bulk" 
                  className="w-full data-[state=active]:bg-gradient-to-br data-[state=active]:from-fuchsia-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-indigo-100 hover:bg-white/5 rounded-lg transition-all duration-200 ease-out p-0.5"
                >
                  <div className="flex items-center py-2 px-2">
                    <div className="mr-2 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-400/80 to-purple-500/80 shadow-md shadow-purple-500/20">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Bulk Email Validation</span>
                  </div>
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
        
        <TabsContent value="single">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden border border-indigo-500/20 bg-white">
              <CardHeader className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 border-b border-blue-700/30 shadow-md shadow-blue-500/10">
                <CardTitle className="text-xl text-white flex items-center">
                  <div className="mr-3 flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/60 to-indigo-600/60 backdrop-blur-sm shadow-lg shadow-blue-700/20 border border-blue-500/30">
                    <MailIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-50">Validate Individual Email</span>
                    <CardDescription className="text-blue-100 mt-1">
                      Smart check for validity, deliverability, and domain health
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-5">
                  <div className="grid gap-3">
                    <Label htmlFor="single-email" className="text-blue-900 font-medium flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <span className="text-lg">Enter email address to validate</span>
                    </Label>
                    <div className="relative mt-2">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
                      <div className="relative">
                        <Input
                          id="single-email"
                          placeholder="email@example.com"
                          value={singleEmail}
                          onChange={(e) => setSingleEmail(e.target.value)}
                          className="pl-14 pr-4 py-7 border-transparent focus:border-transparent bg-white/95 backdrop-blur-md focus:ring-2 focus:ring-blue-500/50 shadow-lg rounded-xl text-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              validateSingleEmail();
                            }
                          }}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
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
                        className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-600 text-white border border-blue-700/30 shadow-xl shadow-blue-500/20 py-6 rounded-xl group"
                      >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="absolute -left-10 -top-10 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
                          <div className="absolute -right-10 -bottom-10 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
                          {isLoading ? 
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : 
                            <MailCheck className="h-5 w-5 mr-2" />
                          }
                          <span className="font-medium text-lg">Validate Email</span>
                        </div>
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
                        className="w-full relative overflow-hidden bg-gradient-to-r from-purple-50 to-fuchsia-50 border-2 border-purple-300/50 text-purple-700 hover:border-purple-400/70 shadow-lg py-6 rounded-xl group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-fuchsia-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 via-fuchsia-400/20 to-pink-400/20 rounded-xl blur opacity-0 group-hover:opacity-80 transition duration-300 group-hover:duration-200"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="absolute -left-10 -top-10 w-24 h-24 rounded-full bg-purple-200/10 blur-2xl group-hover:bg-purple-300/20 transition-all duration-300"></div>
                          <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-fuchsia-200/10 blur-2xl group-hover:bg-fuchsia-300/20 transition-all duration-300"></div>
                          {isLoading ? 
                            <RefreshCw className="h-5 w-5 animate-spin mr-2 text-purple-500" /> : 
                            <div className="relative">
                              <div className="absolute -inset-1 rounded-full bg-purple-400/20 blur-sm animate-pulse"></div>
                              <ShieldCheck className="h-5 w-5 mr-2 text-purple-600 relative" />
                            </div>
                          }
                          <span className="font-medium text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-fuchsia-600">Deep Health Analysis</span>
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {singleValidationResult && (
                      <motion.div
                        key="single-validation-result"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          {singleValidationResult.isValid ? (
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-xl opacity-70 blur"></div>
                          ) : (
                            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 rounded-xl opacity-70 blur"></div>
                          )}
                          <Alert 
                            variant={singleValidationResult.isValid ? "default" : "destructive"}
                            className={`
                              relative border-0 rounded-lg shadow-lg
                              ${singleValidationResult.isValid 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-100 text-green-800' 
                                : 'bg-gradient-to-r from-red-50 to-rose-100 text-red-800'}
                            `}
                          >
                            <div className="flex items-center">
                              <div className={`
                                relative flex items-center justify-center h-12 w-12 rounded-full mr-4
                                ${singleValidationResult.isValid 
                                  ? 'bg-gradient-to-br from-green-500/80 to-emerald-600/80 text-white shadow-lg shadow-green-500/40' 
                                  : 'bg-gradient-to-br from-red-500/80 to-rose-600/80 text-white shadow-lg shadow-red-500/40'}
                              `}>
                                {singleValidationResult.isValid ? (
                                  <>
                                    <div className="absolute inset-0 rounded-full animate-ping-slow bg-green-400/40"></div>
                                    <CheckCircle2 className="h-6 w-6 relative" />
                                  </>
                                ) : (
                                  <>
                                    <div className="absolute inset-0 rounded-full animate-pulse bg-red-400/40"></div>
                                    <XCircle className="h-6 w-6 relative" />
                                  </>
                                )}
                              </div>
                              <div>
                                <AlertTitle className="font-bold text-lg">
                                  {singleValidationResult.isValid 
                                    ? "Email is valid and deliverable" 
                                    : "Email validation failed"
                                  }
                                </AlertTitle>
                                <AlertDescription className="mt-2 text-sm opacity-90">
                                  {singleValidationResult.isValid 
                                    ? (
                                      <div className="flex items-center">
                                        <span className="font-medium mr-2">Normalized:</span>
                                        <code className="px-2 py-1 bg-green-200/50 rounded-md">{singleValidationResult.normalizedEmail}</code>
                                      </div>
                                    ) 
                                    : (
                                      <div className="bg-red-200/50 px-3 py-2 rounded-md">
                                        {singleValidationResult.error}
                                      </div>
                                    )
                                  }
                                </AlertDescription>
                              </div>
                            </div>
                          </Alert>
                        </div>
                      </motion.div>
                    )}
                    
                    {singleHealthResult && (
                      <motion.div
                        key="single-health-result"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="mt-4 overflow-hidden border border-purple-200 shadow-xl">
                          <CardHeader className="relative pb-4 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700"></div>
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/80 to-purple-500/0"></div>
                            
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-fuchsia-500 to-purple-600 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-blue-600 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
                            
                            <CardTitle className="relative z-10 flex items-center text-white">
                              <div className="relative mr-4 group animate-pulse">
                                <div className="absolute -inset-1 rounded-lg bg-white/10 blur-sm group-hover:bg-white/20 transition-all duration-300"></div>
                                <div className="flex items-center justify-center relative h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500/50 to-purple-600/50 backdrop-blur-sm shadow-lg shadow-purple-800/30 border border-purple-500/40 group-hover:from-indigo-500/60 group-hover:to-purple-600/60 transition-all duration-300">
                                  {singleHealthResult.isValid 
                                    ? <ShieldCheck className="h-6 w-6 text-white" /> 
                                    : <AlertTriangle className="h-6 w-6 text-amber-300" />
                                  }
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-xl tracking-tight">
                                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                                    Advanced Email Health Analysis
                                  </span>
                                </span>
                                <span className="text-purple-100 text-sm mt-1 font-normal">Comprehensive diagnostic results for deliverability optimization</span>
                              </div>
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
                                className="mt-5 relative rounded-xl overflow-hidden shadow-lg"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-90"></div>
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-xl"></div>
                                <div className="relative p-5">
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-4 bg-white/20 backdrop-blur-sm p-3 rounded-lg shadow-md">
                                      <Wand2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-lg text-white flex items-center">
                                        <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
                                        AI Smart Correction
                                      </h3>
                                      <p className="text-blue-100 mt-2 text-lg">
                                        Did you mean <span className="text-white font-bold bg-blue-700/30 px-2 py-0.5 rounded-md">{singleHealthResult.suggestedFix}</span>?
                                      </p>
                                      <div className="mt-4 flex space-x-3">
                                        <Button 
                                          className="bg-white hover:bg-blue-50 text-blue-700 border-none shadow-md"
                                          onClick={() => setSingleEmail(singleHealthResult.suggestedFix || '')}
                                        >
                                          <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                                          Apply Correction
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          className="border border-white/30 text-white hover:bg-white/10"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Dismiss
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                            
                            <div className="mt-5 p-5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 shadow-md">
                              <h3 className="text-indigo-800 font-semibold flex items-center mb-3 text-lg">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 p-1.5 mr-3 shadow-sm">
                                  <Eye className="h-5 w-5 text-indigo-600" />
                                </div>
                                Advanced Analysis Report
                              </h3>
                              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-100 shadow-sm">
                                <p className="text-indigo-700 leading-relaxed">{singleHealthResult.details}</p>
                              </div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden border border-indigo-500/20 bg-white">
              <CardHeader className="bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-800 border-b border-purple-700/30 shadow-md shadow-purple-500/10">
                <CardTitle className="text-xl text-white flex items-center">
                  <div className="mr-3 flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-fuchsia-500/60 to-purple-600/60 backdrop-blur-sm shadow-lg shadow-purple-700/20 border border-purple-500/30">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-purple-50">Bulk Email Validation</span>
                    <CardDescription className="text-purple-100 mt-1">
                      Clean entire lists, find & fix issues in batch processing
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-6">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bulk-emails" className="text-indigo-900 font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        Email List Processing
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div>
                              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 cursor-help">AI-Powered</Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Our advanced AI algorithms detect typos, syntax errors, and domain issues for maximum deliverability</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <Textarea
                        id="bulk-emails"
                        placeholder="Enter emails separated by line breaks, commas, or semicolons:
email1@example.com
email2@example.com
email3@domain.com"
                        className="min-h-[220px] border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-sm rounded-lg pl-4 pr-4 py-3"
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={validateBulkEmails} 
                        disabled={isLoading} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border border-indigo-700/30 shadow-md h-11"
                      >
                        {isLoading ? 
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 
                          <MailCheck className="h-4 w-4 mr-2" />
                        }
                        Analyze & Clean Email List
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={handleImportEmails} 
                        className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-11 shadow-sm"
                      >
                        <FileUp className="h-4 w-4 mr-2 text-indigo-600" />
                        Import from File
                      </Button>
                    </motion.div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".txt,.csv,.json"
                      onChange={processImportedFile}
                    />
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {isLoading && (
                      <motion.div 
                        key="bulk-loading"
                        className="space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin" />
                            </div>
                            <div>
                              <h3 className="font-medium text-indigo-900">Processing Email List</h3>
                              <p className="text-sm text-indigo-600">
                                Analyzing {processingStatus.total} emails...
                              </p>
                            </div>
                          </div>
                          <div className="text-xl font-bold text-indigo-700">
                            {Math.round((processingStatus.current / processingStatus.total) * 100)}%
                          </div>
                        </div>
                        <Progress 
                          value={(processingStatus.current / processingStatus.total) * 100} 
                          className="h-2.5 bg-indigo-100" 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence mode="wait">
                    {bulkAnalysisResult && (
                      <motion.div
                        key="bulk-analysis-result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="overflow-hidden border border-indigo-200 shadow-lg bg-white">
                          <CardHeader className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center">
                                <div className="mr-3 flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100">
                                  <FileCheck className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg text-indigo-900">Email List Analysis</CardTitle>
                                  <CardDescription className="text-indigo-700">
                                    Processed {bulkAnalysisResult.summary.total.toLocaleString()} emails
                                  </CardDescription>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 sm:gap-3">
                                <Select value={exportFormat} onValueChange={value => setExportFormat(value as any)}>
                                  <SelectTrigger className="w-[120px] border-indigo-300 text-indigo-700 bg-white">
                                    <SelectValue placeholder="Format" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="txt">Text (.txt)</SelectItem>
                                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                                    <SelectItem value="json">JSON (.json)</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={downloadValidEmails}
                                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-sm"
                                >
                                  <FileDown className="h-4 w-4 mr-2 text-indigo-600" />
                                  Download Valid
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={downloadReport}
                                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-sm"
                                >
                                  <FileTextIcon className="h-4 w-4 mr-2 text-indigo-600" />
                                  Full Report
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                              <motion.div
                                className="rounded-lg overflow-hidden border border-green-200 shadow-sm"
                                whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                              >
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-medium text-green-800">Valid</h3>
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-green-200/80">
                                      <CheckCircle2 className="h-4 w-4 text-green-700" />
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold text-green-700">{bulkAnalysisResult.summary.valid.toLocaleString()}</div>
                                  <div className="flex items-center mt-1">
                                    <div className="h-1.5 w-16 bg-green-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-green-500" 
                                        style={{ width: `${Math.round((bulkAnalysisResult.summary.valid / bulkAnalysisResult.summary.total) * 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-xs text-green-600">
                                      {Math.round((bulkAnalysisResult.summary.valid / bulkAnalysisResult.summary.total) * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                              
                              <motion.div
                                className="rounded-lg overflow-hidden border border-red-200 shadow-sm"
                                whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                              >
                                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-medium text-red-800">Invalid</h3>
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-red-200/80">
                                      <XCircle className="h-4 w-4 text-red-700" />
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold text-red-700">{bulkAnalysisResult.summary.invalid.toLocaleString()}</div>
                                  <div className="flex items-center mt-1">
                                    <div className="h-1.5 w-16 bg-red-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-red-500" 
                                        style={{ width: `${Math.round((bulkAnalysisResult.summary.invalid / bulkAnalysisResult.summary.total) * 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-xs text-red-600">
                                      {Math.round((bulkAnalysisResult.summary.invalid / bulkAnalysisResult.summary.total) * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                              
                              <motion.div
                                className="rounded-lg overflow-hidden border border-amber-200 shadow-sm"
                                whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                              >
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-medium text-amber-800">Duplicates</h3>
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-200/80">
                                      <Copy className="h-4 w-4 text-amber-700" />
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold text-amber-700">{bulkAnalysisResult.summary.duplicates.toLocaleString()}</div>
                                  <div className="flex items-center mt-1">
                                    <div className="h-1.5 w-16 bg-amber-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-amber-500" 
                                        style={{ width: `${Math.round((bulkAnalysisResult.summary.duplicates / bulkAnalysisResult.summary.total) * 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-xs text-amber-600">
                                      {Math.round((bulkAnalysisResult.summary.duplicates / bulkAnalysisResult.summary.total) * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                              
                              <motion.div
                                className="rounded-lg overflow-hidden border border-purple-200 shadow-sm"
                                whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                              >
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-medium text-purple-800">Disposable</h3>
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-purple-200/80">
                                      <Trash2 className="h-4 w-4 text-purple-700" />
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold text-purple-700">{bulkAnalysisResult.summary.disposable.toLocaleString()}</div>
                                  <div className="flex items-center mt-1">
                                    <div className="h-1.5 w-16 bg-purple-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-purple-500" 
                                        style={{ width: `${Math.round((bulkAnalysisResult.summary.disposable / bulkAnalysisResult.summary.total) * 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-xs text-purple-600">
                                      {Math.round((bulkAnalysisResult.summary.disposable / bulkAnalysisResult.summary.total) * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                            
                            <AnimatePresence mode="wait">
                              {bulkAnalysisResult.suggestedFixes.length > 0 && (
                                <motion.div 
                                  key="suggested-fixes"
                                  className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 shadow-sm"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                                        <Wand2 className="h-5 w-5 text-indigo-600" />
                                      </div>
                                      <div>
                                        <h3 className="font-medium text-lg text-indigo-900">AI-Powered Corrections</h3>
                                        <p className="text-indigo-700">
                                          Found {bulkAnalysisResult.suggestedFixes.length} potential typos that can be fixed automatically
                                        </p>
                                      </div>
                                    </div>
                                    <Button 
                                      onClick={handleFixSuggestions}
                                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                                    >
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      Apply All Fixes
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium text-lg text-indigo-900 flex items-center">
                                <Eye className="h-5 w-5 mr-2 text-indigo-600" />
                                Detailed Analysis
                              </h3>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowDetailedReport(!showDetailedReport)}
                                className="text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                              >
                                {showDetailedReport ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    Hide Details
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Show Details
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            <AnimatePresence mode="wait">
                              {showDetailedReport && (
                                <motion.div
                                  key="detailed-report"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="space-y-6">
                                    {bulkAnalysisResult.invalidEmails.length > 0 && (
                                      <div>
                                        <div className="flex items-center mb-3">
                                          <Badge className="bg-red-100 text-red-800 mr-2">Issues</Badge>
                                          <h4 className="font-medium text-gray-700">
                                            Invalid Emails ({bulkAnalysisResult.invalidEmails.length})
                                          </h4>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y bg-white shadow-sm">
                                          {bulkAnalysisResult.invalidEmails.map((item, index) => (
                                            <div key={index} className="p-3 text-sm hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                              <div className="font-medium text-gray-900">{item.email}</div>
                                              <div className="text-red-600 sm:text-right">{item.reason}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {bulkAnalysisResult.suggestedFixes.length > 0 && (
                                      <div>
                                        <div className="flex items-center mb-3">
                                          <Badge className="bg-indigo-100 text-indigo-800 mr-2">Suggestions</Badge>
                                          <h4 className="font-medium text-gray-700">
                                            Suggested Fixes ({bulkAnalysisResult.suggestedFixes.length})
                                          </h4>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y bg-white shadow-sm">
                                          {bulkAnalysisResult.suggestedFixes.map((item, index) => (
                                            <div key={index} className="p-3 text-sm hover:bg-gray-50">
                                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                <div className="flex-1 flex items-center">
                                                  <span className="text-red-600 font-medium">{item.original}</span>
                                                  <svg className="h-5 w-5 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                  </svg>
                                                </div>
                                                <div className="flex-1 text-green-600 font-medium">{item.suggestion}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
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
      </Tabs>
      </motion.div>
    </div>
  );
};

export default EmailValidation;