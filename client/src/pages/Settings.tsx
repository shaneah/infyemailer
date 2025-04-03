import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="row">
        <div className="col-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full lg:w-auto">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="team">Team Members</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="John Smith" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input id="company" defaultValue="MailFlow Inc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="utc-7">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc-12">UTC-12:00</SelectItem>
                          <SelectItem value="utc-11">UTC-11:00</SelectItem>
                          <SelectItem value="utc-10">UTC-10:00</SelectItem>
                          <SelectItem value="utc-9">UTC-09:00</SelectItem>
                          <SelectItem value="utc-8">UTC-08:00</SelectItem>
                          <SelectItem value="utc-7">UTC-07:00 (PDT)</SelectItem>
                          <SelectItem value="utc-6">UTC-06:00 (CST)</SelectItem>
                          <SelectItem value="utc-5">UTC-05:00 (EST)</SelectItem>
                          <SelectItem value="utc-4">UTC-04:00</SelectItem>
                          <SelectItem value="utc-3">UTC-03:00</SelectItem>
                          <SelectItem value="utc-2">UTC-02:00</SelectItem>
                          <SelectItem value="utc-1">UTC-01:00</SelectItem>
                          <SelectItem value="utc">UTC+00:00</SelectItem>
                          <SelectItem value="utc+1">UTC+01:00</SelectItem>
                          <SelectItem value="utc+2">UTC+02:00</SelectItem>
                          <SelectItem value="utc+3">UTC+03:00</SelectItem>
                          <SelectItem value="utc+4">UTC+04:00</SelectItem>
                          <SelectItem value="utc+5">UTC+05:00</SelectItem>
                          <SelectItem value="utc+6">UTC+06:00</SelectItem>
                          <SelectItem value="utc+7">UTC+07:00</SelectItem>
                          <SelectItem value="utc+8">UTC+08:00</SelectItem>
                          <SelectItem value="utc+9">UTC+09:00</SelectItem>
                          <SelectItem value="utc+10">UTC+10:00</SelectItem>
                          <SelectItem value="utc+11">UTC+11:00</SelectItem>
                          <SelectItem value="utc+12">UTC+12:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="marketing" defaultChecked={true} />
                      <Label htmlFor="marketing">Receive marketing emails</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notifications" defaultChecked={true} />
                      <Label htmlFor="notifications">Receive campaign report notifications</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input id="current_password" type="password" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input id="new_password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input id="confirm_password" type="password" />
                      </div>
                    </div>
                    <div className="pt-2 flex items-center space-x-2">
                      <Switch id="two_factor" />
                      <div>
                        <Label htmlFor="two_factor">Two-factor authentication</Label>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Team Members Settings */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        Manage access and permissions for your team
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      Invite Team Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full bg-blue-100 p-2 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">JS</span>
                          </div>
                          <div>
                            <p className="font-medium">John Smith</p>
                            <p className="text-sm text-gray-500">john@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-600 border-none">Owner</Badge>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                      </div>

                      <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">JD</span>
                          </div>
                          <div>
                            <p className="font-medium">Jane Doe</p>
                            <p className="text-sm text-gray-500">jane@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-100 text-purple-600 border-none">Admin</Badge>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">RJ</span>
                          </div>
                          <div>
                            <p className="font-medium">Robert Johnson</p>
                            <p className="text-sm text-gray-500">robert@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-600 border-none">Editor</Badge>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Role Permissions</h3>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Owner</p>
                            <p className="text-sm text-gray-500">Full access to all settings and billing</p>
                          </div>
                          <Button variant="outline" size="sm">Edit Permissions</Button>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Admin</p>
                            <p className="text-sm text-gray-500">Access to all features except billing</p>
                          </div>
                          <Button variant="outline" size="sm">Edit Permissions</Button>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Editor</p>
                            <p className="text-sm text-gray-500">Can create and edit campaigns, but cannot access settings</p>
                          </div>
                          <Button variant="outline" size="sm">Edit Permissions</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold">Professional Plan</h3>
                            <div className="mt-1 flex items-center">
                              <p className="text-2xl font-bold">$79</p>
                              <span className="text-gray-500 ml-1">/month</span>
                            </div>
                            <ul className="mt-3 space-y-1 text-sm text-gray-600">
                              <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Up to 25,000 emails/month
                              </li>
                              <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Unlimited contacts
                              </li>
                              <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Advanced analytics
                              </li>
                              <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                A/B testing
                              </li>
                              <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Custom domain
                              </li>
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <Button variant="outline">Change Plan</Button>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full">
                              Cancel Plan
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-600">Next billing date</p>
                            <p className="text-sm font-medium">May 1, 2025</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Payment Method</h3>
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="22" y2="10" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">Visa ending in 4242</p>
                              <p className="text-sm text-gray-500">Expires 12/2025</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Billing History</h3>
                        <div className="rounded-md border">
                          <div className="p-3 border-b flex items-center justify-between">
                            <div>
                              <p className="font-medium">Apr 1, 2025</p>
                              <p className="text-sm text-gray-500">Professional Plan - Monthly</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$79.00</p>
                              <p className="text-xs text-green-600">Paid</p>
                            </div>
                          </div>
                          <div className="p-3 border-b flex items-center justify-between">
                            <div>
                              <p className="font-medium">Mar 1, 2025</p>
                              <p className="text-sm text-gray-500">Professional Plan - Monthly</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$79.00</p>
                              <p className="text-xs text-green-600">Paid</p>
                            </div>
                          </div>
                          <div className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium">Feb 1, 2025</p>
                              <p className="text-sm text-gray-500">Professional Plan - Monthly</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$79.00</p>
                              <p className="text-xs text-green-600">Paid</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <Button variant="link" size="sm" className="h-auto p-0">View all invoices</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Details</CardTitle>
                    <CardDescription>
                      Manage your billing information and tax settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billing_name">Name</Label>
                          <Input id="billing_name" defaultValue="John Smith" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing_email">Email</Label>
                          <Input id="billing_email" type="email" defaultValue="john@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input id="company_name" defaultValue="MailFlow Inc." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
                          <Input id="tax_id" defaultValue="US123456789" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_line1">Address Line 1</Label>
                          <Input id="address_line1" defaultValue="123 Mail Street" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address_line2">Address Line 2</Label>
                          <Input id="address_line2" defaultValue="Suite 101" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" defaultValue="San Francisco" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State / Province</Label>
                          <Input id="state" defaultValue="CA" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip_code">ZIP / Postal Code</Label>
                          <Input id="zip_code" defaultValue="94103" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select defaultValue="us">
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="au">Australia</SelectItem>
                              <SelectItem value="de">Germany</SelectItem>
                              <SelectItem value="fr">France</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button variant="default" onClick={handleSave} disabled={loading}>
                          {loading ? "Saving..." : "Save Billing Details"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}