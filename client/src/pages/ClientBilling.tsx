import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Calendar, 
  Download, 
  RefreshCw, 
  PlusCircle,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import AnimatedCreditProgressBar from '@/components/AnimatedCreditProgressBar';
import PlanCreditsBubbles from '@/components/PlanCreditsBubbles';

const ClientBilling = () => {
  const { toast } = useToast();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [purchaseCreditsDialog, setPurchaseCreditsDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditAmount, setCreditAmount] = useState<string>("100");
  
  // Current plan data
  const currentPlan = {
    name: "Business",
    monthlyCost: 49.99,
    nextBillingDate: "May 16, 2025",
    includedCredits: 5000,
    emailsSent: 2870,
    creditsRemaining: 2130
  };
  
  // Billing history data
  const billingHistory = [
    { 
      id: "INV-2025-04-16", 
      date: "April 16, 2025", 
      description: "Business Plan - Monthly", 
      amount: 49.99, 
      status: "Paid" 
    },
    { 
      id: "INV-2025-03-16", 
      date: "March 16, 2025", 
      description: "Business Plan - Monthly", 
      amount: 49.99, 
      status: "Paid" 
    },
    { 
      id: "INV-2025-02-16", 
      date: "February 16, 2025", 
      description: "Business Plan - Monthly", 
      amount: 49.99, 
      status: "Paid" 
    },
    { 
      id: "CRED-2025-02-10", 
      date: "February 10, 2025", 
      description: "Additional Credits - 1,000", 
      amount: 29.99, 
      status: "Paid" 
    },
    { 
      id: "INV-2025-01-16", 
      date: "January 16, 2025", 
      description: "Business Plan - Monthly", 
      amount: 49.99, 
      status: "Paid" 
    }
  ];
  
  // Plan options data
  const planOptions = [
    {
      name: "Starter",
      monthlyCost: 19.99,
      includedCredits: 2000,
      features: [
        "Up to 2,000 emails per month",
        "Basic email templates",
        "Standard analytics",
        "Email validation (100/mo)",
        "1 team member"
      ]
    },
    {
      name: "Business",
      monthlyCost: 49.99,
      includedCredits: 5000,
      features: [
        "Up to 5,000 emails per month",
        "Advanced templates with A/B testing",
        "Detailed analytics & reporting",
        "Email validation (500/mo)",
        "3 team members",
        "Custom domain setup"
      ],
      current: true
    },
    {
      name: "Enterprise",
      monthlyCost: 99.99,
      includedCredits: 15000,
      features: [
        "Up to 15,000 emails per month",
        "Premium templates & builder",
        "AI-powered analytics & insights",
        "Unlimited email validation",
        "10 team members",
        "Priority support",
        "API access"
      ]
    }
  ];
  
  // Credit purchase options
  const creditOptions = [
    { amount: "100", price: 4.99 },
    { amount: "500", price: 19.99 },
    { amount: "1000", price: 29.99 },
    { amount: "5000", price: 99.99 }
  ];
  
  const handleUpgrade = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowUpgradeDialog(false);
      
      toast({
        title: "Plan upgrade request submitted",
        description: "Our team will contact you shortly to complete the upgrade process.",
        variant: "default",
      });
    }, 1500);
  };
  
  const handlePurchaseCredits = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseCreditsDialog(false);
      
      const creditsAdded = parseInt(creditAmount);
      
      toast({
        title: "Credits purchased successfully",
        description: `${creditsAdded.toLocaleString()} credits have been added to your account.`,
        variant: "default",
      });
    }, 1500);
  };
  
  const getCreditPrice = (amount: string) => {
    const option = creditOptions.find(opt => opt.amount === amount);
    return option ? option.price : 0;
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold tracking-tight">Billing & Credits</h1>
      </div>
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="summary">Account Summary</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Your subscription details and upcoming billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-purple-50 rounded-lg mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-800">{currentPlan.name} Plan</h3>
                      <p className="text-purple-700">${currentPlan.monthlyCost}/month</p>
                    </div>
                    <div className="mt-2 md:mt-0 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-purple-600 mr-1" />
                      <span className="text-sm text-purple-700">Next billing: {currentPlan.nextBillingDate}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          <h4 className="font-medium">Email Credits Used</h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-80 text-xs">Credits are consumed when you send emails. One credit equals one email sent. Your current plan includes {currentPlan.includedCredits.toLocaleString()} credits per month.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {currentPlan.emailsSent.toLocaleString()} / {currentPlan.includedCredits.toLocaleString()}
                        </span>
                      </div>
                      <AnimatedCreditProgressBar 
                        used={currentPlan.emailsSent}
                        total={currentPlan.includedCredits}
                        animate={true}
                        showEmojis={true}
                        className="mb-2"
                      />
                      <div className="text-xs text-purple-600 font-medium">
                        {currentPlan.creditsRemaining.toLocaleString()} credits remaining this billing cycle
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={purchaseCreditsDialog} onOpenChange={setPurchaseCreditsDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Purchase Additional Credits
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Purchase Additional Credits</DialogTitle>
                        <DialogDescription>
                          Add more email credits to your account. These credits never expire and will be used after your monthly allocation.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 gap-3">
                          {creditOptions.map((option) => (
                            <button
                              key={option.amount}
                              className={`p-3 border rounded-md text-center transition-colors ${
                                creditAmount === option.amount 
                                  ? 'border-purple-600 bg-purple-50 text-purple-800' 
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                              onClick={() => setCreditAmount(option.amount)}
                            >
                              <div className="font-semibold">{option.amount}</div>
                              <div className="text-sm text-muted-foreground">${option.price}</div>
                            </button>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="custom-amount">Or enter custom amount:</Label>
                          <Input
                            id="custom-amount"
                            type="number"
                            placeholder="Enter amount"
                            min="1"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                          />
                        </div>
                        
                        <Alert variant="default" className="bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertTitle>Pricing Information</AlertTitle>
                          <AlertDescription>
                            Custom credit amounts are priced at approximately $0.05 per credit, with volume discounts for larger purchases.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPurchaseCreditsDialog(false)}>Cancel</Button>
                        <Button 
                          onClick={handlePurchaseCredits}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Purchase for $${getCreditPrice(creditAmount)}`
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Upgrade Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upgrade Your Plan</DialogTitle>
                        <DialogDescription>
                          Would you like to upgrade to our Enterprise plan for enhanced features and more sending capacity?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                          <h3 className="font-semibold text-purple-800 mb-2">Enterprise Plan - $99.99/month</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-1" />
                              <span>15,000 monthly email credits</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-1" />
                              <span>AI-powered analytics & insights</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-1" />
                              <span>Unlimited email validation</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-1" />
                              <span>10 team members</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-1" />
                              <span>Priority support</span>
                            </li>
                          </ul>
                        </div>
                        <Alert variant="default" className="bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertTitle>Plan Change Information</AlertTitle>
                          <AlertDescription>
                            Your current plan will remain active until the end of your billing cycle. The new plan will take effect immediately after approval by our team.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>Cancel</Button>
                        <Button 
                          onClick={handleUpgrade}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Request Upgrade"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-6 bg-blue-900 rounded mr-3 flex items-center justify-center text-white text-xs">VISA</div>
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 09/2027</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Default</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Contact our billing support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line></svg>
                    Billing FAQ
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3.8a2 2 0 0 0 1.4-.6L12 4.8a2 2 0 0 1 1.4-.6h3.8a2 2 0 0 1 2 2v2.2z"></path></svg>
                    Request Invoice Copy
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                  <CardDescription>
                    Your current billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <p className="font-medium">Acme Corporation</p>
                    <p>123 Business Avenue</p>
                    <p>Suite 456</p>
                    <p>New York, NY 10001</p>
                    <p>United States</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Address
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your past invoices and receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Invoice</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">Description</th>
                      <th className="py-3 px-4 text-right font-medium">Amount</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((invoice, index) => (
                      <tr key={invoice.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}`}>
                        <td className="py-3 px-4 font-medium">{invoice.id}</td>
                        <td className="py-3 px-4">{invoice.date}</td>
                        <td className="py-3 px-4">{invoice.description}</td>
                        <td className="py-3 px-4 text-right">${invoice.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.status === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                <Download className="mr-2 h-4 w-4" />
                Download All Invoices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planOptions.map((plan) => (
              <Card key={plan.name} className={plan.current ? 'border-purple-400 shadow-md' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.current && (
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">${plan.monthlyCost}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <PlanCreditsBubbles 
                  credits={plan.includedCredits} 
                  isActive={plan.current} 
                  className="mx-4 mt-2"
                />
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Includes:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.name === "Enterprise" ? "default" : "outline"}
                      onClick={() => setShowUpgradeDialog(true)}
                    >
                      {plan.name === "Starter" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-8">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Custom Plans Available</AlertTitle>
              <AlertDescription>
                Need a custom solution? If you have specific requirements or need higher email volumes, contact our sales team for a tailored plan.
                <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                  Contact Sales →
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientBilling;