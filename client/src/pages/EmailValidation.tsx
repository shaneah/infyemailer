import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Info, 
  FileText, 
  Upload as UploadIcon, 
  Star, 
  CheckCircle2, 
  Cloud, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { SiDropbox, SiGoogledrive, SiOneplus, SiAmazon } from "react-icons/si";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Type definitions for validation results
interface EmailCredits {
  available: number;
  used: number;
  total: number;
}

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

const EmailValidation = () => {
  // State management
  const [showSingleEmailModal, setShowSingleEmailModal] = useState(false);
  const [showBatchEmailModal, setShowBatchEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [batchEmailInput, setBatchEmailInput] = useState('');
  const [fileType, setFileType] = useState<'single' | 'multiple'>('single');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState('all');
  
  // Validation result states
  const [singleValidationResult, setSingleValidationResult] = useState<EmailHealthResult | null>(null);
  const [batchValidationResult, setBatchValidationResult] = useState<BatchValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch credits information
  const { data: credits, isLoading: isLoadingCredits } = useQuery<EmailCredits>({
    queryKey: ['/api/email-validation/credits'],
    refetchOnWindowFocus: false
  });

  // Single email validation mutation
  const validateSingleEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/email-validation/health-check', { email });
      return await response.json() as EmailHealthResult;
    },
    onSuccess: (data) => {
      setSingleValidationResult(data);
      setIsValidating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive",
      });
      setIsValidating(false);
    }
  });

  // Batch email validation mutation
  const validateBatchEmailsMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const response = await apiRequest('POST', '/api/email-validation/batch', { emails });
      return await response.json() as BatchValidationResult;
    },
    onSuccess: (data) => {
      setBatchValidationResult(data);
      setIsValidating(false);
      // Invalidate credits query to update the count
      queryClient.invalidateQueries({ queryKey: ['/api/email-validation/credits'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Batch validation failed",
        description: error.message,
        variant: "destructive",
      });
      setIsValidating(false);
    }
  });

  // Purchase credits mutation
  const purchaseCreditsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', '/api/email-validation/purchase-credits', { amount });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Credits purchased",
        description: `Successfully purchased ${data.transaction.amount} credits.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-validation/credits'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type === 'text/csv' || 
        file.type === 'text/plain' || 
        file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.csv') || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.xls') || 
        file.name.endsWith('.xlsx')
      ) {
        setUploadedFile(file);
        parseFileContent(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV, TXT, XLS, or XLSX file.",
          variant: "destructive",
        });
      }
    }
  };

  // Parse file content to extract emails
  const parseFileContent = (file: File) => {
    setIsParsing(true);
    setParseProgress(0);
    
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setParseProgress(progress);
      }
    };
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Simple parsing - assume one email per line for CSV and TXT
        const emails = content
          .split(/[\r\n,;]+/) // Split by newlines, commas, or semicolons
          .map(email => email.trim())
          .filter(email => {
            // Very basic email validation for preprocessing
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email && emailRegex.test(email);
          });
        
        if (emails.length === 0) {
          toast({
            title: "No valid emails found",
            description: "The file does not contain any valid email addresses.",
            variant: "destructive",
          });
        } else {
          setBatchEmailInput(emails.join('\n'));
          setShowBatchEmailModal(true);
          
          toast({
            title: "File parsed successfully",
            description: `Found ${emails.length} potential email addresses.`,
          });
        }
      } catch (error) {
        toast({
          title: "Error parsing file",
          description: "There was an error parsing the file. Please check the format.",
          variant: "destructive",
        });
      }
      
      setIsParsing(false);
      setParseProgress(100);
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the file.",
        variant: "destructive",
      });
      setIsParsing(false);
    };
    
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === 'text/csv' || 
        file.type === 'text/plain' || 
        file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.csv') || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.xls') || 
        file.name.endsWith('.xlsx')
      ) {
        setUploadedFile(file);
        parseFileContent(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV, TXT, XLS, or XLSX file.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle validation form submission
  const handleSingleEmailValidation = () => {
    if (!emailInput) {
      toast({
        title: "Email required",
        description: "Please enter an email address to validate.",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    setSingleValidationResult(null);
    validateSingleEmailMutation.mutate(emailInput);
  };
  
  const handleBatchEmailValidation = () => {
    if (!batchEmailInput) {
      toast({
        title: "Emails required",
        description: "Please enter at least one email address to validate.",
        variant: "destructive",
      });
      return;
    }
    
    const emails = batchEmailInput
      .split(/[\r\n,;]+/)
      .map(email => email.trim())
      .filter(email => email);
    
    if (emails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter valid email addresses to validate.",
        variant: "destructive",
      });
      return;
    }
    
    if (!credits || emails.length > credits.available) {
      toast({
        title: "Insufficient credits",
        description: `You need ${emails.length} credits, but only have ${credits?.available || 0} available.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    setBatchValidationResult(null);
    validateBatchEmailsMutation.mutate(emails);
  };

  // Buy 1000 credits
  const handleBuyCredits = () => {
    purchaseCreditsMutation.mutate(1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Validate</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">
              {isLoadingCredits ? "Loading..." : `${credits?.available || 0} credits`}
            </span>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <Button 
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={handleBuyCredits}
            disabled={purchaseCreditsMutation.isPending}
          >
            {purchaseCreditsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : "Buy Credits"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Individual Email Validation */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-lg p-2">
                <Mail className="text-purple-600 h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-1">Individual Email Validation</h3>
                <p className="text-gray-500 text-sm mb-8">Verify up to 25 emails at a time. 1 credit per email.</p>
                <Button 
                  className="bg-purple-700 hover:bg-purple-800"
                  onClick={() => setShowSingleEmailModal(true)}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Upload File Section */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Upload your file</h3>
            <p className="text-gray-500 text-sm mb-4">Supports: CSV, TXT, XLS, or XLSX</p>
            
            <div className="flex mb-4 gap-2">
              <div className="flex items-center">
                <RadioGroup 
                  value={fileType} 
                  onValueChange={(value) => setFileType(value as 'single' | 'multiple')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Multiple</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept=".csv,.txt,.xls,.xlsx,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
            />
            
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center">
                {isParsing ? (
                  <>
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
                    <p className="text-gray-500 text-sm mb-1">Parsing file...</p>
                    <Progress value={parseProgress} className="w-full max-w-xs h-2 mb-2" />
                    <p className="text-gray-500 text-xs">{parseProgress}%</p>
                  </>
                ) : (
                  <>
                    <div className="text-purple-600 mb-2">
                      <UploadIcon className="h-8 w-8" />
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Drag and drop your files here</p>
                    <p className="text-gray-500 text-sm mb-4">or <span className="text-blue-500 hover:underline cursor-pointer">Browse Files</span> on your computer</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-700 font-medium mb-2">Connect to your cloud based files</p>
              <div className="grid grid-cols-5 gap-2">
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <SiDropbox className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">Dropbox</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <SiGoogledrive className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">Google Drive</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <Cloud className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">Microsoft OneDrive</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <SiAmazon className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="text-xs">Amazon S3</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center py-4 h-auto">
                  <FileText className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs">SFTP/FTP</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Integration Section */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Add an Integration</h3>
            
            <div className="flex space-x-2 mb-4 border-b overflow-x-auto">
              <Button 
                variant={selectedIntegration === 'all' ? "default" : "ghost"} 
                className="text-xs px-2 py-1 h-auto"
                onClick={() => setSelectedIntegration('all')}
              >
                ALL
              </Button>
              <Button 
                variant={selectedIntegration === 'official' ? "default" : "ghost"} 
                className="text-xs px-2 py-1 h-auto"
                onClick={() => setSelectedIntegration('official')}
              >
                OFFICIAL
              </Button>
              <Button 
                variant={selectedIntegration === 'third-party' ? "default" : "ghost"} 
                className="text-xs px-2 py-1 h-auto"
                onClick={() => setSelectedIntegration('third-party')}
              >
                3RD PARTY
              </Button>
              <Button 
                variant={selectedIntegration === 'zapier' ? "default" : "ghost"} 
                className="text-xs px-2 py-1 h-auto"
                onClick={() => setSelectedIntegration('zapier')}
              >
                ZAPIER
              </Button>
              <Button 
                variant={selectedIntegration === 'ifttt' ? "default" : "ghost"} 
                className="text-xs px-2 py-1 h-auto"
                onClick={() => setSelectedIntegration('ifttt')}
              >
                IFTT/APP.IO
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">AC</span>
                    </div>
                  </div>
                  <span>ActiveCampaign</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">AM</span>
                    </div>
                  </div>
                  <span>Adobe Marketo</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">AW</span>
                    </div>
                  </div>
                  <span>AWeber</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">BC</span>
                    </div>
                  </div>
                  <span>BigCommerce</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">CC</span>
                    </div>
                  </div>
                  <span>ConstantContact</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-full p-1">
                    <div className="bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">D</span>
                    </div>
                  </div>
                  <span>Drip</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-1">
                    <div className="bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center text-white">
                      <span className="text-xs font-bold">G</span>
                    </div>
                  </div>
                  <span>Ghost</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Setup Email Validation Rules */}
          <Card className="border shadow-sm hover:shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 rounded-lg p-2">
                  <Mail className="text-purple-600 h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">Setup Email Validation Rules</h3>
                  <p className="text-gray-500 text-sm">Allow or block specific emails, email domains, TLD or mx records.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Need More Credits */}
          <Card 
            className="border shadow-sm hover:shadow cursor-pointer" 
            onClick={handleBuyCredits}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 rounded-lg p-2">
                  <CheckCircle2 className="text-purple-600 h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">Need more credits?</h3>
                  <p className="text-gray-500 text-sm">Purchase validation credits to keep verifying your emails</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Single Email Validation Modal */}
      <Dialog open={showSingleEmailModal} onOpenChange={setShowSingleEmailModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Validate Single Email</DialogTitle>
            <DialogDescription>
              Enter an email address to validate. This will use 1 credit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="example@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            
            {singleValidationResult && (
              <div className="mt-4">
                <Alert variant={singleValidationResult.isValid ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {singleValidationResult.isValid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {singleValidationResult.isValid ? "Valid Email" : "Invalid Email"}
                    </AlertTitle>
                  </div>
                  <AlertDescription>
                    {singleValidationResult.details}
                    
                    {singleValidationResult.suggestedFix && (
                      <div className="mt-2">
                        <p className="font-medium">Did you mean: </p>
                        <p className="text-blue-600">{singleValidationResult.suggestedFix}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${singleValidationResult.hasMxRecords ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>MX Records</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${!singleValidationResult.isDisposable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Not Disposable</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${!singleValidationResult.isDuplicate ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Not Duplicate</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${!singleValidationResult.hasSyntaxErrors ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Valid Syntax</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSingleEmailModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSingleEmailValidation}
              disabled={isValidating || !emailInput}
            >
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Email Validation Modal */}
      <Dialog open={showBatchEmailModal} onOpenChange={setShowBatchEmailModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Email Validation</DialogTitle>
            <DialogDescription>
              Enter or paste multiple email addresses (one per line). Each email will use 1 credit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="batchEmails">Email Addresses</Label>
                {uploadedFile && (
                  <span className="text-sm text-muted-foreground">
                    From: {uploadedFile.name}
                  </span>
                )}
              </div>
              <Textarea
                id="batchEmails"
                placeholder="example1@domain.com&#10;example2@domain.com&#10;example3@domain.com"
                value={batchEmailInput}
                onChange={(e) => setBatchEmailInput(e.target.value)}
                rows={10}
              />
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Enter one email per line or separated by commas</span>
                <span>
                  {batchEmailInput.split(/[\r\n,;]+/).filter(Boolean).length} email(s)
                </span>
              </div>
            </div>
            
            {batchValidationResult && (
              <Tabs defaultValue="summary" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                  <TabsTrigger value="valid" className="flex-1">
                    Valid ({batchValidationResult.validCount})
                  </TabsTrigger>
                  <TabsTrigger value="invalid" className="flex-1">
                    Invalid ({batchValidationResult.invalidCount})
                  </TabsTrigger>
                  <TabsTrigger value="duplicates" className="flex-1">
                    Duplicates ({batchValidationResult.duplicateCount})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <div className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Total Processed</span>
                            <span className="text-2xl font-semibold">{batchValidationResult.totalProcessed}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Valid Emails</span>
                            <span className="text-2xl font-semibold text-green-600">{batchValidationResult.validCount}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Invalid Emails</span>
                            <span className="text-2xl font-semibold text-red-600">{batchValidationResult.invalidCount}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Duplicates</span>
                            <span className="text-2xl font-semibold text-yellow-600">{batchValidationResult.duplicateCount}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <div className="h-8 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="flex h-full">
                              <div 
                                style={{ width: `${(batchValidationResult.validCount / batchValidationResult.totalProcessed) * 100}%` }}
                                className="bg-green-500"
                              ></div>
                              <div 
                                style={{ width: `${(batchValidationResult.invalidCount / batchValidationResult.totalProcessed) * 100}%` }}
                                className="bg-red-500"
                              ></div>
                              <div 
                                style={{ width: `${(batchValidationResult.duplicateCount / batchValidationResult.totalProcessed) * 100}%` }}
                                className="bg-yellow-500"
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-green-600">{Math.round((batchValidationResult.validCount / batchValidationResult.totalProcessed) * 100)}% Valid</span>
                            <span className="text-red-600">{Math.round((batchValidationResult.invalidCount / batchValidationResult.totalProcessed) * 100)}% Invalid</span>
                            <span className="text-yellow-600">{Math.round((batchValidationResult.duplicateCount / batchValidationResult.totalProcessed) * 100)}% Duplicates</span>
                          </div>
                        </div>
                        
                        <Button className="w-full mt-6">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Export Results
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="valid">
                  <div className="border rounded-md p-4 h-[300px] overflow-y-auto">
                    {batchValidationResult.validEmails.length > 0 ? (
                      <ul className="space-y-2">
                        {batchValidationResult.validEmails.map((email, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{email}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No valid emails found
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="invalid">
                  <div className="border rounded-md p-4 h-[300px] overflow-y-auto">
                    {batchValidationResult.invalidEmails.length > 0 ? (
                      <ul className="space-y-2">
                        {batchValidationResult.invalidEmails.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <div>
                              <div>{item.email}</div>
                              <div className="text-sm text-muted-foreground">{item.reason}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No invalid emails found
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="duplicates">
                  <div className="border rounded-md p-4 h-[300px] overflow-y-auto">
                    {batchValidationResult.duplicateEmails.length > 0 ? (
                      <ul className="space-y-2">
                        {batchValidationResult.duplicateEmails.map((email, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>{email}</span>
                            <Badge variant="outline" className="ml-auto">Duplicate</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No duplicate emails found
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowBatchEmailModal(false)}
            >
              Close
            </Button>
            <Button 
              type="submit" 
              onClick={handleBatchEmailValidation}
              disabled={isValidating || !batchEmailInput}
            >
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isValidating ? 'Validating...' : 'Validate All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailValidation;