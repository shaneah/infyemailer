import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle, Upload, RefreshCw, Download, FileUp, FileDown, FileType, FileJson, FileText as FileTextIcon, ChevronUp, ChevronDown, Sparkles, Copy } from "lucide-react";
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-xl p-6 md:p-8 mb-8 shadow-xl bg-[#1a3a5f]">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "30px 30px"
        }}></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f5f0e1] via-[#d4af37] to-[#f5f0e1]">
              Email Validation & Cleaning
            </span>
          </h1>
          <p className="text-[#f5f0e1]/90 text-base md:text-lg max-w-3xl mb-4 md:mb-6">
            Enhance your campaign performance with our premium email validation service
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-4">
            <div className="flex items-center p-3 rounded-lg bg-[#1a3a5f]/50 backdrop-blur border border-[#d4af37]/30">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-3 text-[#d4af37]" />
              <span className="text-[#f5f0e1] text-sm md:text-base">Remove invalid emails</span>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-[#1a3a5f]/50 backdrop-blur border border-[#d4af37]/30">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-3 text-[#d4af37]" />
              <span className="text-[#f5f0e1] text-sm md:text-base">Detect and fix typos</span>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-[#1a3a5f]/50 backdrop-blur border border-[#d4af37]/30">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-3 text-[#d4af37]" />
              <span className="text-[#f5f0e1] text-sm md:text-base">Identify disposable emails</span>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-[#1a3a5f]/50 backdrop-blur border border-[#d4af37]/30">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-3 text-[#d4af37]" />
              <span className="text-[#f5f0e1] text-sm md:text-base">Boost deliverability rates</span>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="single" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-[#f5f0e1] rounded-lg">
          <TabsTrigger value="single" className="data-[state=active]:bg-[#1a3a5f] data-[state=active]:text-white rounded-md">
            <div className="flex items-center py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-7.5" />
                <path d="m22 6-10 7L2 6" />
              </svg>
              Single Email Validation
            </div>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="data-[state=active]:bg-[#1a3a5f] data-[state=active]:text-white rounded-md">
            <div className="flex items-center py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
              Bulk Email Validation
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <Card className="border-0 shadow-xl overflow-hidden border border-[#d4af37]/20">
            <CardHeader className="bg-gradient-to-r from-[#f5f0e1] to-[#f5f0e1]/70 border-b border-[#d4af37]/20">
              <CardTitle className="text-xl text-[#1a3a5f] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#1a3a5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-7.5" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                Validate Individual Email
              </CardTitle>
              <CardDescription className="text-[#1a3a5f]/70">
                Check if an email address is valid, deliverable, and not disposable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="single-email">Email Address</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="single-email"
                      placeholder="email@example.com"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                    />
                    <Button 
                      onClick={validateSingleEmail} 
                      disabled={isLoading}
                      className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90 text-white border border-[#d4af37]/30"
                    >
                      {isLoading ? 
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      }
                      Validate
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={checkEmailHealth} 
                      disabled={isLoading}
                      className="border-[#d4af37]/40 text-[#1a3a5f] hover:bg-[#f5f0e1]"
                    >
                      {isLoading ? 
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 
                        <AlertCircle className="h-4 w-4 mr-2 text-[#d4af37]" />
                      }
                      Health Check
                    </Button>
                  </div>
                </div>
                
                {singleValidationResult && (
                  <Alert variant={singleValidationResult.isValid ? "default" : "destructive"}>
                    <div className="flex items-center">
                      {singleValidationResult.isValid 
                        ? <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" /> 
                        : <XCircle className="h-5 w-5 mr-2" />
                      }
                      <AlertTitle>
                        {singleValidationResult.isValid 
                          ? "Email is valid" 
                          : "Email is invalid"
                        }
                      </AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      {singleValidationResult.isValid 
                        ? `Normalized email: ${singleValidationResult.normalizedEmail}` 
                        : singleValidationResult.error
                      }
                    </AlertDescription>
                  </Alert>
                )}
                
                {singleHealthResult && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        {singleHealthResult.isValid 
                          ? <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" /> 
                          : <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                        }
                        Email Health Check
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getHealthStatusColor(singleHealthResult.hasMxRecords)}`}></div>
                          <span>MX Records: {singleHealthResult.hasMxRecords ? "Valid" : "Invalid"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getHealthStatusColor(!singleHealthResult.isDisposable)}`}></div>
                          <span>Disposable Email: {singleHealthResult.isDisposable ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getHealthStatusColor(!singleHealthResult.isDuplicate)}`}></div>
                          <span>Duplicate: {singleHealthResult.isDuplicate ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getHealthStatusColor(!singleHealthResult.hasSyntaxErrors)}`}></div>
                          <span>Syntax: {singleHealthResult.hasSyntaxErrors ? "Invalid" : "Valid"}</span>
                        </div>
                      </div>
                      
                      {singleHealthResult.suggestedFix && (
                        <div className="mt-4 p-3 bg-[#f5f0e1]/70 text-[#1a3a5f] rounded border border-[#d4af37]/30">
                          <p><strong>Suggestion:</strong> Did you mean <span className="text-[#d4af37] font-semibold">{singleHealthResult.suggestedFix}</span>?</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 border-[#d4af37]/40 text-[#1a3a5f] hover:bg-[#f5f0e1]"
                            onClick={() => setSingleEmail(singleHealthResult.suggestedFix || '')}
                          >
                            <Sparkles className="h-4 w-4 mr-2 text-[#d4af37]" />
                            Apply Suggestion
                          </Button>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <p><strong>Details:</strong> {singleHealthResult.details}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default EmailValidation;