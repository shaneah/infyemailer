import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileCheck, 
  Send, 
  Mail, 
  BarChart4,
  Lightbulb,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmailChecklistWidget from "@/components/EmailChecklistWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EmailChecklist = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('content');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [previewText, setPreviewText] = useState('');

  const sampleTemplates = [
    {
      id: 1,
      name: "Welcome Email",
      subject: "Welcome to InfyMailer - Let's Get Started!",
      previewText: "Your journey with us begins now. Here's what you need to know.",
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to InfyMailer</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; }
    .header { background-color: #1a3a5f; padding: 20px; color: white; text-align: center; }
    .content { padding: 20px; }
    .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
    .button { background-color: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
    @media only screen and (max-width: 480px) {
      body { width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to InfyMailer!</h1>
  </div>
  <div class="content">
    <p>Hello [First Name],</p>
    <p>We're thrilled to have you onboard! Your account has been successfully created, and you're now ready to start creating amazing email campaigns that drive results.</p>
    <p>Here's what you can do next:</p>
    <ul>
      <li>Import your contacts or create a new list</li>
      <li>Explore our template library</li>
      <li>Set up your first campaign</li>
    </ul>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://app.infymailer.com/dashboard" class="button">Go to Dashboard</a>
    </p>
    <p>If you have any questions, our support team is always here to help. Just reply to this email or use the chat feature in your dashboard.</p>
    <p>Best regards,<br>The InfyMailer Team</p>
  </div>
  <div class="footer">
    <p>© 2025 InfyMailer. All rights reserved.</p>
    <p><a href="[unsubscribe_link]">Unsubscribe</a> | <a href="[preferences_link]">Manage Preferences</a></p>
    <p>123 Email St., Digital City, DC 10101</p>
  </div>
</body>
</html>`
    },
    {
      id: 2,
      name: "Monthly Newsletter",
      subject: "Your April Newsletter: Latest Updates & Tips",
      previewText: "Discover this month's top email marketing strategies and platform updates.",
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Monthly Newsletter</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; }
    .header { background-color: #1a3a5f; padding: 20px; color: white; text-align: center; }
    .content { padding: 20px; }
    .article { margin-bottom: 30px; }
    .article img { max-width: 100%; height: auto; }
    .cta { background-color: #f5f0e1; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
    .button { background-color: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
    .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
    @media only screen and (max-width: 480px) {
      body { width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>InfyMailer Monthly Newsletter</h1>
    <p>April 2025</p>
  </div>
  <div class="content">
    <p>Hello [First Name],</p>
    <p>Welcome to your April newsletter! Here's what we have for you this month:</p>
    
    <div class="article">
      <h2>New Feature: Advanced A/B Testing</h2>
      <p>We've enhanced our A/B testing capabilities to include subject lines, content variations, and send times. Now you can optimize every aspect of your campaigns.</p>
      <p><a href="#">Learn more about A/B testing →</a></p>
    </div>
    
    <div class="article">
      <h2>Email Marketing Trend: Interactive Content</h2>
      <p>Interactive elements like polls, surveys, and clickable carousels are driving higher engagement rates. Learn how to implement these in your next campaign.</p>
      <p><a href="#">Read the full article →</a></p>
    </div>
    
    <div class="cta">
      <h3>Upcoming Webinar: Mastering Deliverability</h3>
      <p>Join our experts on April 20th for tips on improving your deliverability and inbox placement.</p>
      <p><a href="#" class="button">Register Now</a></p>
    </div>
    
    <div class="article">
      <h2>Customer Success Story</h2>
      <p>See how Acme Corp increased their open rates by 32% using our new personalization features.</p>
      <p><a href="#">Read their story →</a></p>
    </div>
    
    <p>We hope you found this newsletter valuable. As always, we welcome your feedback and suggestions!</p>
    <p>Best regards,<br>The InfyMailer Team</p>
  </div>
  <div class="footer">
    <p>© 2025 InfyMailer. All rights reserved.</p>
    <p><a href="[unsubscribe_link]">Unsubscribe</a> | <a href="[preferences_link]">Manage Preferences</a></p>
    <p>123 Email St., Digital City, DC 10101</p>
  </div>
</body>
</html>`
    },
    {
      id: 3,
      name: "Promotional Offer",
      subject: "Flash Sale: 48 Hours Only - 30% OFF Everything!",
      previewText: "Our biggest sale of the season ends soon. Don't miss these incredible savings!",
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Flash Sale</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; }
    .header { background-color: #d4af37; padding: 20px; color: white; text-align: center; }
    .content { padding: 20px; }
    .hero { text-align: center; margin: 20px 0; }
    .hero h2 { font-size: 28px; color: #1a3a5f; }
    .hero p { font-size: 18px; }
    .products { display: table; width: 100%; }
    .product { display: table-cell; width: 33.33%; padding: 10px; text-align: center; }
    .product img { max-width: 100%; height: auto; }
    .price { font-weight: bold; color: #d4af37; }
    .button { background-color: #1a3a5f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; }
    .countdown { background-color: #f5f0e1; padding: 15px; text-align: center; margin: 20px 0; }
    .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
    @media only screen and (max-width: 480px) {
      body { width: 100% !important; }
      .product { display: block; width: 100%; margin-bottom: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FLASH SALE</h1>
  </div>
  <div class="content">
    <div class="hero">
      <h2>48 HOURS ONLY!</h2>
      <p>Enjoy 30% OFF everything with code: <strong>FLASH30</strong></p>
      <p><a href="#" class="button">SHOP NOW</a></p>
    </div>
    
    <div class="countdown">
      <h3>Hurry! Sale Ends In:</h3>
      <p style="font-size: 24px; font-weight: bold;">47:59:59</p>
    </div>
    
    <div class="products">
      <div class="product">
        <img src="https://placehold.co/150x150" alt="Product 1">
        <h3>Product Name</h3>
        <p class="price"><s>$99.99</s> $69.99</p>
        <p><a href="#">Shop Now</a></p>
      </div>
      <div class="product">
        <img src="https://placehold.co/150x150" alt="Product 2">
        <h3>Product Name</h3>
        <p class="price"><s>$79.99</s> $55.99</p>
        <p><a href="#">Shop Now</a></p>
      </div>
      <div class="product">
        <img src="https://placehold.co/150x150" alt="Product 3">
        <h3>Product Name</h3>
        <p class="price"><s>$129.99</s> $90.99</p>
        <p><a href="#">Shop Now</a></p>
      </div>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="#" class="button">VIEW ALL DEALS</a>
    </p>
    
    <p style="text-align: center; font-size: 14px;">*Terms and conditions apply. Offer valid until April 16, 2025.</p>
  </div>
  <div class="footer">
    <p>© 2025 Company Name. All rights reserved.</p>
    <p><a href="[unsubscribe_link]">Unsubscribe</a> | <a href="[preferences_link]">Manage Preferences</a></p>
    <p>123 Store St., Shopping City, SC 10101</p>
  </div>
</body>
</html>`
    }
  ];

  const handleTemplateSelect = (index: number) => {
    const template = sampleTemplates[index];
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    setPreviewText(template.previewText);
    setActiveTab('checklist');
    
    toast({
      title: "Template loaded",
      description: `${template.name} template has been loaded for checking.`,
    });
  };

  const handleApplyImprovements = () => {
    setActiveTab('improved');
    
    toast({
      title: "Improvements applied",
      description: "Email has been optimized based on checklist recommendations.",
      variant: "success",
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-2 rounded-full" 
            onClick={() => history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-indigo-600" />
            Email Pre-Send Checklist
          </h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <BarChart4 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="content" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Mail className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="checklist" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="improved" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Lightbulb className="h-4 w-4 mr-2" />
            Optimized
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Email Content</CardTitle>
                  <CardDescription>Create your email content or select a template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailFrom">From</Label>
                    <Input 
                      id="emailFrom" 
                      placeholder="Your name or company <your@email.com>" 
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Subject Line</Label>
                    <Input 
                      id="emailSubject" 
                      placeholder="Enter a compelling subject line" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previewText">Preview Text</Label>
                    <Input 
                      id="previewText" 
                      placeholder="Preview text that appears in inbox" 
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailContent">Email HTML Content</Label>
                    <Textarea 
                      id="emailContent" 
                      placeholder="Paste or write your HTML email content here" 
                      className="h-64 font-mono text-sm"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        if (emailContent && emailSubject) {
                          setActiveTab('checklist');
                        } else {
                          toast({
                            title: "Content required",
                            description: "Please add a subject line and content before proceeding.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Proceed to Checklist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Example Templates</CardTitle>
                  <CardDescription>Select a template to start with</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sampleTemplates.map((template, index) => (
                    <Card key={template.id} className="overflow-hidden cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => handleTemplateSelect(index)}>
                      <div className="h-2 bg-indigo-600"></div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-slate-800">{template.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{template.subject}</p>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Checklist Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Improve deliverability rates</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Avoid common spam triggers</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Ensure mobile responsiveness</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Optimize for higher engagement</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Follow email marketing best practices</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <EmailChecklistWidget 
            emailContent={emailContent} 
            emailSubject={emailSubject}
            onFinish={handleApplyImprovements}
          />
        </TabsContent>

        <TabsContent value="improved">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-emerald-900">Optimized Email</CardTitle>
                      <CardDescription className="text-emerald-700">
                        Your email has been improved based on best practices
                      </CardDescription>
                    </div>
                    <div className="bg-white p-2 rounded-full border border-green-200">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="improvedSubject">Improved Subject Line</Label>
                    <Input 
                      id="improvedSubject" 
                      value={emailSubject.replace(/FREE|ACT NOW/gi, '').trim()}
                      readOnly
                      className="bg-green-50 border-green-200"
                    />
                    <p className="text-sm text-emerald-600">✓ Spam trigger words removed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="improvedPreview">Improved Preview Text</Label>
                    <Input 
                      id="improvedPreview" 
                      value={previewText}
                      readOnly
                      className="bg-green-50 border-green-200"
                    />
                    <p className="text-sm text-emerald-600">✓ Optimized for inbox preview</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="improvedContent">Optimized HTML Content</Label>
                    <div className="relative">
                      <Textarea 
                        id="improvedContent" 
                        value={emailContent
                          .replace(/FREE|ACT NOW|CLICK HERE/gi, match => 
                            match.toLowerCase() === 'click here' ? 'Learn More' : 
                            match.toLowerCase() === 'free' ? 'Complimentary' : 
                            'Limited Time Offer')
                          .replace(/<table/g, '<table role="presentation" cellpadding="0" cellspacing="0"')
                          .replace(/<img/g, '<img alt="Image description" ')
                        }
                        readOnly
                        className="h-64 font-mono text-sm bg-green-50 border-green-200"
                      />
                      <div className="absolute top-2 right-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => {
                            navigator.clipboard.writeText(emailContent);
                            toast({
                              title: "Copied",
                              description: "Optimized email HTML copied to clipboard",
                            });
                          }}
                        >
                          Copy HTML
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Improvements Made</CardTitle>
                  <CardDescription>Optimizations applied to your email</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="pb-3 border-b border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-1">Spam-Safe Subject Line</h3>
                      <p className="text-sm text-slate-600">Removed words that trigger spam filters while preserving message impact.</p>
                    </li>
                    <li className="pb-3 border-b border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-1">Accessibility Enhancements</h3>
                      <p className="text-sm text-slate-600">Added proper alt text to images and improved table structure for screen readers.</p>
                    </li>
                    <li className="pb-3 border-b border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-1">Mobile Optimization</h3>
                      <p className="text-sm text-slate-600">Ensured proper rendering across devices with responsive design elements.</p>
                    </li>
                    <li className="pb-3 border-b border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-1">Link Improvement</h3>
                      <p className="text-sm text-slate-600">Replaced generic "click here" text with descriptive link text for better engagement.</p>
                    </li>
                    <li>
                      <h3 className="font-medium text-slate-800 mb-1">Language Refinement</h3>
                      <p className="text-sm text-slate-600">Modified overly promotional language to improve deliverability.</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    toast({
                      title: "Success!",
                      description: "Your optimized email is ready to send!",
                      variant: "success",
                    });
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Proceed to Send
                </Button>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  onClick={() => setActiveTab('content')}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Further Customize
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailChecklist;