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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Lightbulb, 
  Phone, 
  ImageIcon, 
  Link2, 
  Settings, 
  Clock, 
  ShieldCheck,
  FileText,
  MoveRight,
  BarChart4
} from "lucide-react";

interface EmailChecklistProps {
  emailContent?: string;
  emailSubject?: string;
  onFinish?: () => void;
}

export const EmailChecklistWidget: React.FC<EmailChecklistProps> = ({
  emailContent = "",
  emailSubject = "",
  onFinish
}) => {
  const [progress, setProgress] = useState(0);
  const [checklistResults, setChecklistResults] = useState<{
    id: string;
    title: string;
    status: 'pass' | 'warn' | 'fail' | 'pending';
    icon: React.ReactNode;
    details: string;
    tips: string[];
  }[]>([
    {
      id: 'spam-triggers',
      title: 'Spam Trigger Analysis',
      status: 'pending',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      details: 'Checks your email content for common words and phrases that might trigger spam filters.',
      tips: [
        'Avoid ALL CAPS in subject lines',
        'Don\'t use excessive exclamation marks!!!',
        'Avoid phrases like "free", "guaranteed", "act now"',
        'Limit the use of dollar signs and percentages'
      ]
    },
    {
      id: 'mobile-responsive',
      title: 'Mobile Responsiveness',
      status: 'pending',
      icon: <Phone className="h-5 w-5 text-blue-500" />,
      details: 'Ensures your email template displays properly on mobile devices.',
      tips: [
        'Use a single-column layout for mobile devices',
        'Make CTA buttons at least 44x44 pixels for touch targets',
        'Keep subject lines under 50 characters',
        'Optimize images for mobile loading speeds'
      ]
    },
    {
      id: 'image-text-ratio',
      title: 'Image-to-Text Ratio',
      status: 'pending',
      icon: <ImageIcon className="h-5 w-5 text-purple-500" />,
      details: 'Evaluates the balance between images and text in your email.',
      tips: [
        'Aim for a 60:40 text-to-image ratio',
        'Always include ALT text for images',
        'Don\'t embed critical information only in images',
        'Compress images to improve load time'
      ]
    },
    {
      id: 'links-tracking',
      title: 'Links & Tracking',
      status: 'pending',
      icon: <Link2 className="h-5 w-5 text-indigo-500" />,
      details: 'Confirms that all links are working and proper tracking is in place.',
      tips: [
        'Test all links before sending',
        'Use UTM parameters for campaign tracking',
        'Include a clear unsubscribe link',
        'Avoid link shorteners that might get flagged'
      ]
    },
    {
      id: 'preview-text',
      title: 'Subject & Preview Text',
      status: 'pending',
      icon: <FileText className="h-5 w-5 text-green-500" />,
      details: 'Reviews your subject line and preview text for effectiveness.',
      tips: [
        'Keep subject lines under 50 characters',
        'Use personalization in subject lines when possible',
        'Create preview text that complements your subject line',
        'A/B test different subject lines for important campaigns'
      ]
    },
    {
      id: 'sending-config',
      title: 'Sending Configuration',
      status: 'pending',
      icon: <Settings className="h-5 w-5 text-slate-500" />,
      details: 'Checks your sender configuration for optimal deliverability.',
      tips: [
        'Use a recognized sender name',
        'Send from a domain with proper DKIM/SPF records',
        'Monitor your sender reputation',
        'Segment your audience for more targeted sending'
      ]
    },
    {
      id: 'delivery-timing',
      title: 'Delivery Timing',
      status: 'pending',
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      details: 'Suggests optimal sending times based on your audience.',
      tips: [
        'Consider your audience\'s time zone',
        'B2B emails typically perform better Tuesday-Thursday',
        'B2C emails often perform better on weekends',
        'Test different sending times for your specific audience'
      ]
    },
    {
      id: 'security-compliance',
      title: 'Security & Compliance',
      status: 'pending',
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      details: 'Ensures your email meets security standards and regulatory requirements.',
      tips: [
        'Include a physical address (required by law)',
        'Provide a clear unsubscribe method',
        'Honor opt-out requests promptly',
        'Keep your subscriber lists clean and updated'
      ]
    }
  ]);

  // Simulate checklist evaluation
  useEffect(() => {
    const runChecks = async () => {
      let newProgress = 0;
      let updatedResults = [...checklistResults];
      
      // Function to update a specific check status
      const updateCheckStatus = (index: number, status: 'pass' | 'warn' | 'fail') => {
        updatedResults[index] = {
          ...updatedResults[index],
          status
        };
        setChecklistResults([...updatedResults]);
      };
      
      // Simulate spam trigger analysis
      setTimeout(() => {
        // Simulate the check based on content
        const spamWords = ['free', 'guarantee', 'cash', 'winner', 'act now', 'buy now', 'click here'];
        const containsSpamWords = spamWords.some(word => 
          emailContent.toLowerCase().includes(word.toLowerCase()) || 
          emailSubject.toLowerCase().includes(word.toLowerCase())
        );
        
        const status = containsSpamWords ? 'warn' : 'pass';
        updateCheckStatus(0, status);
        newProgress += 12.5;
        setProgress(newProgress);
      }, 800);
      
      // Simulate mobile responsiveness check
      setTimeout(() => {
        // This would be more complex in a real implementation
        const hasResponsiveElements = emailContent.includes('max-width') || emailContent.includes('media query');
        const status = hasResponsiveElements ? 'pass' : 'warn';
        updateCheckStatus(1, status);
        newProgress += 12.5;
        setProgress(newProgress);
      }, 1600);
      
      // Simulate image-to-text ratio check
      setTimeout(() => {
        const imgCount = (emailContent.match(/<img/g) || []).length;
        const textLength = emailContent.replace(/<[^>]*>/g, '').length;
        
        // Simple heuristic - in practice this would be more sophisticated
        const status = imgCount > 0 && textLength > imgCount * 200 ? 'pass' : 'warn';
        updateCheckStatus(2, status);
        newProgress += 12.5;
        setProgress(newProgress);
      }, 2400);
      
      // Simulate links check
      setTimeout(() => {
        const hasLinks = emailContent.includes('href=');
        const hasTracking = emailContent.includes('utm_') || emailContent.includes('tracking');
        
        let status: 'pass' | 'warn' | 'fail' = 'fail';
        if (hasLinks && hasTracking) {
          status = 'pass';
        } else if (hasLinks) {
          status = 'warn';
        }
        
        updateCheckStatus(3, status);
        newProgress += 12.5;
        setProgress(newProgress);
      }, 3200);
      
      // Simulate subject & preview text check
      setTimeout(() => {
        const subjectLength = emailSubject.length;
        const status = subjectLength > 0 && subjectLength < 50 ? 'pass' : 'warn';
        updateCheckStatus(4, status);
        newProgress += 12.5;
        setProgress(newProgress);
      }, 4000);
      
      // Simulate the final checks with default pass status for demo
      setTimeout(() => {
        updateCheckStatus(5, 'pass');
        newProgress += 12.5;
        setProgress(newProgress);
      }, 4800);
      
      setTimeout(() => {
        updateCheckStatus(6, 'pass');
        newProgress += 12.5;
        setProgress(newProgress);
      }, 5600);
      
      setTimeout(() => {
        updateCheckStatus(7, 'pass');
        newProgress += 12.5;
        setProgress(100);
      }, 6400);
    };
    
    runChecks();
  }, [emailContent, emailSubject]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pass</Badge>;
      case 'warn':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warning</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Fail</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Checking...</Badge>;
    }
  };

  const passedChecks = checklistResults.filter(item => item.status === 'pass').length;
  const totalChecks = checklistResults.length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  return (
    <Card className="w-full shadow-md border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-indigo-900">Email Campaign Checklist</CardTitle>
            <CardDescription className="text-indigo-700">
              Ensure your email follows best practices before sending
            </CardDescription>
          </div>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-indigo-200 shadow-sm">
            <div className="text-center">
              <span className="block text-2xl font-bold text-indigo-700">{score}%</span>
              <span className="text-xs text-indigo-500">Score</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Checklist Progress</span>
            <span className="text-indigo-700 font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName="bg-indigo-600" />
        </div>

        <Accordion type="single" collapsible className="w-full">
          {checklistResults.map(item => (
            <AccordionItem key={item.id} value={item.id} className="border-b border-indigo-100">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-slate-800">{item.title}</h3>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1">
                <div className="bg-slate-50 p-4 rounded-md mb-3">
                  <p className="text-slate-700">{item.details}</p>
                </div>
                <h4 className="font-medium text-indigo-700 flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" /> 
                  Best Practice Tips
                </h4>
                <ul className="space-y-2">
                  {item.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 text-indigo-500">•</span>
                      <span className="text-slate-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-indigo-50 to-blue-50 border-t border-indigo-100 flex justify-between">
        <div className="text-slate-700 flex items-center gap-1">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>{passedChecks} of {totalChecks} checks passed</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={() => window.open('https://example.com/email-best-practices', '_blank')}
          >
            View Best Practices
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={onFinish}
          >
            <span>Apply Improvements</span>
            <MoveRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EmailChecklistWidget;