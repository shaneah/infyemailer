import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertCircle, 
  ListChecks, 
  Sparkles, 
  Image, 
  BarChart2,
  LayoutList,
  FileText,
  Link,
  FileSpreadsheet,
  Hourglass,
  MessageSquare,
  MousePointer,
  Search
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EmailChecklistProps {
  emailContent?: string;
  emailSubject?: string;
  onFinish?: () => void;
}

interface CheckResult {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'checking';
  details?: string[];
  recommendation?: string;
  category: 'spam' | 'content' | 'mobile' | 'delivery';
  icon: React.ReactNode;
}

const EmailChecklistWidget: React.FC<EmailChecklistProps> = ({
  emailContent = '',
  emailSubject = '',
  onFinish
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [currentCategory, setCurrentCategory] = useState<'spam' | 'content' | 'mobile' | 'delivery'>('spam');
  const [overallScore, setOverallScore] = useState(0);
  
  // Simulate analysis process
  useEffect(() => {
    if (emailContent && emailSubject) {
      setIsAnalyzing(true);
      
      // Initialize progress
      setProgress(0);
      
      // Reset results
      setCheckResults([]);
      
      // Simulate checking process with delays
      const totalSteps = 100;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep += 1;
        setProgress(Math.min(currentStep, totalSteps));
        
        if (currentStep >= 25 && currentStep < 50) {
          setCurrentCategory('content');
        } else if (currentStep >= 50 && currentStep < 75) {
          setCurrentCategory('mobile');
        } else if (currentStep >= 75) {
          setCurrentCategory('delivery');
        }
        
        if (currentStep >= totalSteps) {
          clearInterval(interval);
          setIsAnalyzing(false);
          generateResults();
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [emailContent, emailSubject]);
  
  const generateResults = () => {
    // Simulate checklist results based on content analysis
    const results: CheckResult[] = [];
    
    // Spam Checks
    results.push({
      id: 'spam_subject',
      title: 'Subject Line',
      description: 'Checking subject line for spam triggers',
      status: emailSubject.toUpperCase().includes('FREE') || emailSubject.includes('!!!!') 
        ? 'failed' 
        : 'passed',
      details: emailSubject.toUpperCase().includes('FREE') 
        ? ['Found potential spam word: "FREE"'] 
        : [],
      recommendation: emailSubject.toUpperCase().includes('FREE') 
        ? 'Avoid using "FREE" in all caps. Try alternatives like "Complimentary" or "No Cost"' 
        : '',
      category: 'spam',
      icon: <FileText className="h-5 w-5" />
    });
    
    results.push({
      id: 'spam_exclamation',
      title: 'Excessive Punctuation',
      description: 'Checking for overuse of exclamation points or all caps',
      status: emailContent.includes('!!!') || /[A-Z]{10,}/.test(emailContent) 
        ? 'failed' 
        : 'passed',
      details: emailContent.includes('!!!') 
        ? ['Found multiple exclamation points together'] 
        : [],
      recommendation: emailContent.includes('!!!') 
        ? 'Reduce the use of consecutive exclamation points. Use a single exclamation point for emphasis.' 
        : '',
      category: 'spam',
      icon: <AlertCircle className="h-5 w-5" />
    });
    
    results.push({
      id: 'spam_buy_now',
      title: 'Promotional Language',
      description: 'Checking for hard-sell language',
      status: emailContent.includes('BUY NOW') || emailContent.includes('ACT NOW') 
        ? 'warning' 
        : 'passed',
      details: emailContent.includes('BUY NOW') 
        ? ['Found promotional phrase: "BUY NOW"'] 
        : [],
      recommendation: emailContent.includes('BUY NOW') 
        ? 'Consider replacing "BUY NOW" with "Learn More" or "Shop Today"' 
        : '',
      category: 'spam',
      icon: <MessageSquare className="h-5 w-5" />
    });
    
    // Content Checks
    results.push({
      id: 'content_image_text',
      title: 'Image-to-Text Ratio',
      description: 'Checking balance between images and text',
      status: emailContent.includes('<img') && (emailContent.match(/<img/g) || []).length > 5 
        ? 'warning' 
        : 'passed',
      details: (emailContent.match(/<img/g) || []).length > 5 
        ? ['Found ' + (emailContent.match(/<img/g) || []).length + ' images, which may be too many'] 
        : [],
      recommendation: (emailContent.match(/<img/g) || []).length > 5 
        ? 'Consider reducing the number of images to improve deliverability' 
        : '',
      category: 'content',
      icon: <Image className="h-5 w-5" />
    });
    
    results.push({
      id: 'content_alt_text',
      title: 'Image Alt Text',
      description: 'Checking if images have proper alt text',
      status: emailContent.includes('<img') && !emailContent.includes('alt=') 
        ? 'failed' 
        : 'passed',
      details: emailContent.includes('<img') && !emailContent.includes('alt=') 
        ? ['Images are missing alt text'] 
        : [],
      recommendation: emailContent.includes('<img') && !emailContent.includes('alt=') 
        ? 'Add descriptive alt text to all images to improve accessibility' 
        : '',
      category: 'content',
      icon: <FileSpreadsheet className="h-5 w-5" />
    });
    
    results.push({
      id: 'content_broken_links',
      title: 'Link Destinations',
      description: 'Checking for placeholder or broken links',
      status: emailContent.includes('href="#"') || emailContent.includes('href="http://example.com') 
        ? 'failed' 
        : 'passed',
      details: emailContent.includes('href="#"') 
        ? ['Found placeholder links: href="#"'] 
        : [],
      recommendation: emailContent.includes('href="#"') 
        ? 'Replace placeholder links with actual URLs' 
        : '',
      category: 'content',
      icon: <Link className="h-5 w-5" />
    });
    
    results.push({
      id: 'content_click_here',
      title: 'Meaningful Link Text',
      description: 'Checking for generic link text like "click here"',
      status: emailContent.toLowerCase().includes('>click here<') 
        ? 'warning' 
        : 'passed',
      details: emailContent.toLowerCase().includes('>click here<') 
        ? ['Found generic link text: "click here"'] 
        : [],
      recommendation: emailContent.toLowerCase().includes('>click here<') 
        ? 'Replace "click here" with more descriptive link text' 
        : '',
      category: 'content',
      icon: <MousePointer className="h-5 w-5" />
    });
    
    // Mobile Checks
    results.push({
      id: 'mobile_viewport',
      title: 'Viewport Meta Tag',
      description: 'Checking if email has viewport meta tag',
      status: emailContent.includes('viewport') 
        ? 'passed' 
        : 'warning',
      details: !emailContent.includes('viewport') 
        ? ['Missing viewport meta tag'] 
        : [],
      recommendation: !emailContent.includes('viewport') 
        ? 'Add viewport meta tag for better mobile rendering: <meta name="viewport" content="width=device-width, initial-scale=1.0">' 
        : '',
      category: 'mobile',
      icon: <LayoutList className="h-5 w-5" />
    });
    
    results.push({
      id: 'mobile_responsive',
      title: 'Responsive Design',
      description: 'Checking for responsive techniques',
      status: emailContent.includes('@media') 
        ? 'passed' 
        : 'warning',
      details: !emailContent.includes('@media') 
        ? ['No media queries found for responsive design'] 
        : [],
      recommendation: !emailContent.includes('@media') 
        ? 'Add media queries for responsive styling on mobile devices' 
        : '',
      category: 'mobile',
      icon: <BarChart2 className="h-5 w-5" />
    });
    
    // Delivery Checks
    results.push({
      id: 'delivery_unsubscribe',
      title: 'Unsubscribe Link',
      description: 'Checking for required unsubscribe link',
      status: emailContent.toLowerCase().includes('unsubscribe') 
        ? 'passed' 
        : 'failed',
      details: !emailContent.toLowerCase().includes('unsubscribe') 
        ? ['Missing unsubscribe link'] 
        : [],
      recommendation: !emailContent.toLowerCase().includes('unsubscribe') 
        ? 'Add a clear unsubscribe link to comply with anti-spam regulations' 
        : '',
      category: 'delivery',
      icon: <Search className="h-5 w-5" />
    });
    
    results.push({
      id: 'delivery_sender',
      title: 'Sender Information',
      description: 'Checking for sender details and address',
      status: emailContent.toLowerCase().includes('address') || emailContent.includes('contact') 
        ? 'passed' 
        : 'warning',
      details: !emailContent.toLowerCase().includes('address') && !emailContent.includes('contact') 
        ? ['Missing physical address or contact information'] 
        : [],
      recommendation: !emailContent.toLowerCase().includes('address') && !emailContent.includes('contact') 
        ? 'Include your physical mailing address to comply with CAN-SPAM and similar regulations' 
        : '',
      category: 'delivery',
      icon: <Hourglass className="h-5 w-5" />
    });
    
    setCheckResults(results);
    
    // Calculate overall score
    const passedCount = results.filter(r => r.status === 'passed').length;
    const totalChecks = results.length;
    const score = Math.round((passedCount / totalChecks) * 100);
    setOverallScore(score);
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spam':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'content':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'mobile':
        return <LayoutList className="h-5 w-5 text-purple-500" />;
      case 'delivery':
        return <Hourglass className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'checking':
        return <Hourglass className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Warning</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Checking</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const getResultsByCategory = (category: string) => {
    return checkResults.filter(result => result.category === category);
  };
  
  const categoryScores = {
    spam: Math.round((getResultsByCategory('spam').filter(r => r.status === 'passed').length / Math.max(1, getResultsByCategory('spam').length)) * 100),
    content: Math.round((getResultsByCategory('content').filter(r => r.status === 'passed').length / Math.max(1, getResultsByCategory('content').length)) * 100),
    mobile: Math.round((getResultsByCategory('mobile').filter(r => r.status === 'passed').length / Math.max(1, getResultsByCategory('mobile').length)) * 100),
    delivery: Math.round((getResultsByCategory('delivery').filter(r => r.status === 'passed').length / Math.max(1, getResultsByCategory('delivery').length)) * 100),
  };
  
  const categoryLabels = {
    spam: 'Spam Check',
    content: 'Content Quality',
    mobile: 'Mobile Friendliness',
    delivery: 'Deliverability',
  };
  
  if (isAnalyzing) {
    return (
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="text-xl">
            Analyzing Your Email
          </CardTitle>
          <CardDescription>
            Checking your email content against best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-full">
                <Progress value={progress} className="h-2" />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            
            <div className="flex items-center mt-4 text-indigo-600 animate-pulse">
              <Sparkles className="h-5 w-5 mr-2" />
              <span>
                {currentCategory === 'spam' && 'Checking for spam triggers...'}
                {currentCategory === 'content' && 'Analyzing content quality...'}
                {currentCategory === 'mobile' && 'Evaluating mobile-friendliness...'}
                {currentCategory === 'delivery' && 'Assessing deliverability factors...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (checkResults.length === 0) {
    // This would happen if no content was provided
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Email Checklist</CardTitle>
          <CardDescription>
            Please provide email content to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium">No Content Found</h3>
            <p className="text-slate-500 mt-2 max-w-md">
              Enter your email content in the previous step to run the pre-send checklist
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl">Overall Score</CardTitle>
            <CardDescription>
              Summary of your email quality check
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}%
                  </span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={getScoreColor(overallScore).replace('text-', 'text-')}
                    strokeWidth="10"
                    strokeDasharray={`${overallScore * 2.51327}, 251.327`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Passed</span>
                  </div>
                  <span className="text-2xl font-semibold">
                    {checkResults.filter(r => r.status === 'passed').length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-sm">Warnings</span>
                  </div>
                  <span className="text-2xl font-semibold">
                    {checkResults.filter(r => r.status === 'warning').length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="text-2xl font-semibold">
                    {checkResults.filter(r => r.status === 'failed').length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-sm">Total</span>
                  </div>
                  <span className="text-2xl font-semibold">{checkResults.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      {getCategoryIcon(key)}
                      <span className="ml-2 text-sm font-medium">{label}</span>
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(categoryScores[key as keyof typeof categoryScores])}`}>
                      {categoryScores[key as keyof typeof categoryScores]}%
                    </span>
                  </div>
                  <Progress 
                    value={categoryScores[key as keyof typeof categoryScores]} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="col-span-1 md:col-span-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Email Quality Checklist</CardTitle>
                <CardDescription>
                  Review issues and recommendations for your email
                </CardDescription>
              </div>
              <ListChecks className="h-8 w-8 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="space-y-4">
                  <div className="flex items-center">
                    {getCategoryIcon(key)}
                    <h3 className="text-lg font-semibold ml-2">{label}</h3>
                  </div>
                  
                  <div className="space-y-4 pl-6">
                    {getResultsByCategory(key).map((result) => (
                      <div key={result.id} className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-gray-50">
                          <div className="flex items-center">
                            {getStatusIcon(result.status)}
                            <h4 className="font-medium ml-2">{result.title}</h4>
                          </div>
                          {getStatusLabel(result.status)}
                        </div>
                        
                        {(result.status === 'failed' || result.status === 'warning') && (
                          <div className="p-4 border-t">
                            <p className="text-sm text-gray-700 mb-2">
                              {result.description}
                            </p>
                            
                            {result.details && result.details.length > 0 && (
                              <div className="mt-2 bg-gray-50 p-3 rounded text-sm">
                                <p className="font-medium mb-1">Issues found:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                  {result.details.map((detail, idx) => (
                                    <li key={idx} className="text-red-700">{detail}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.recommendation && (
                              <div className="mt-3 bg-blue-50 p-3 rounded text-sm text-blue-800">
                                <p className="font-medium mb-1">Recommendation:</p>
                                <p>{result.recommendation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {key !== 'delivery' && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <div className="flex justify-end w-full">
              <Button
                onClick={onFinish}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Apply Recommendations & Optimize
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmailChecklistWidget;