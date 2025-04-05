import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubjectLineGenerator from '@/components/emails/SubjectLineGenerator';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [showAiSubjectGenerator, setShowAiSubjectGenerator] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    content: '',
    senderName: 'Your Company',
    replyToEmail: 'info@example.com'
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch existing emails
  const { 
    data: emails, 
    isLoading
  } = useQuery({
    queryKey: ['/api/emails'],
    enabled: activeTab === 'sent'
  });
  
  // Mutation to send email
  const { mutate: sendEmail, isPending } = useMutation({
    mutationFn: async (emailData: any) => {
      return apiRequest('/api/emails', {
        method: 'POST',
        body: JSON.stringify(emailData)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: 'Your email has been sent successfully.',
      });
      setIsComposeOpen(false);
      setEmailForm({
        to: '',
        subject: '',
        content: '',
        senderName: 'Your Company',
        replyToEmail: 'info@example.com'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmail(emailForm);
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setIsComposeOpen(false);
    setShowAiSubjectGenerator(false);
  };
  
  // Sample email data for inbox
  const inboxEmails = [
    {
      id: 1,
      sender: 'John Smith',
      email: 'john@example.com',
      subject: 'Question about your service',
      date: 'May 15, 2023',
      unread: true
    },
    {
      id: 2,
      sender: 'Support Team',
      email: 'support@provider.com',
      subject: 'Your account has been updated',
      date: 'May 14, 2023',
      unread: false
    },
    {
      id: 3,
      sender: 'Marketing Insights',
      email: 'insights@marketpro.com',
      subject: 'Your weekly marketing report',
      date: 'May 12, 2023',
      unread: false
    }
  ];
  
  // Sample email data for drafts
  const draftEmails = [
    {
      id: 1,
      recipient: 'Sales Team',
      subject: 'Q2 Sales Strategy',
      date: 'May 10, 2023'
    },
    {
      id: 2,
      recipient: 'All Subscribers',
      subject: 'Summer Collection Launch',
      date: 'May 9, 2023'
    }
  ];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Emails</h1>
          <p className="text-gray-500">Manage your email communications</p>
        </div>
        <Button onClick={() => setIsComposeOpen(true)}>Compose Email</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox
            <Badge variant="secondary" className="ml-2">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts
            <Badge variant="secondary" className="ml-2">2</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox" className="mt-6">
          <div className="space-y-4">
            {inboxEmails.map(email => (
              <Card key={email.id} className={email.unread ? 'border-primary' : ''}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        {email.sender}
                        {email.unread && (
                          <Badge variant="default" className="ml-2">New</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{email.email}</CardDescription>
                    </div>
                    <span className="text-sm text-gray-500">{email.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="font-medium">{email.subject}</p>
                </CardContent>
                <CardFooter className="py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reply</Button>
                    <Button variant="ghost" size="sm">Forward</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="sent" className="mt-6">
          {isLoading ? (
            <div className="text-center py-10">Loading sent emails...</div>
          ) : ((emails as any[])?.length || 0) > 0 ? (
            <div className="space-y-4">
              {(emails as any[])?.map((email: any) => (
                <Card key={email.id}>
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>To: {email.to}</CardTitle>
                        <CardDescription>
                          From: {email.senderName} &lt;{email.replyToEmail}&gt;
                        </CardDescription>
                      </div>
                      <span className="text-sm text-gray-500">
                        {email.sentAt ? new Date(email.sentAt).toLocaleDateString() : 'Not sent'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="font-medium">{email.subject}</p>
                    <div className="mt-2 border-t pt-2">
                      <div 
                        className="prose prose-sm max-h-24 overflow-hidden" 
                        dangerouslySetInnerHTML={{ __html: email.content }}
                      />
                      {email.content.length > 150 && (
                        <div className="text-right mt-2">
                          <button className="text-sm text-primary">Show more</button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Resend</Button>
                      <Button variant="ghost" size="sm">Forward</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-10">
              <CardContent>
                <p className="mb-4">No sent emails found</p>
                <Button onClick={() => setIsComposeOpen(true)}>
                  Compose Your First Email
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="drafts" className="mt-6">
          <div className="space-y-4">
            {draftEmails.map(draft => (
              <Card key={draft.id}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>To: {draft.recipient}</CardTitle>
                      <CardDescription>Draft saved on {draft.date}</CardDescription>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="font-medium">{draft.subject}</p>
                </CardContent>
                <CardFooter className="py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="default" size="sm">Send</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Compose Email Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compose New Email</DialogTitle>
            <DialogDescription>
              Create and send an email to your contacts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="to" className="text-right">
                  To:
                </Label>
                <Input
                  id="to"
                  name="to"
                  value={emailForm.to}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject:
                </Label>
                <div className="relative col-span-3">
                  <Input
                    id="subject"
                    name="subject"
                    value={emailForm.subject}
                    onChange={handleChange}
                    className="w-full pr-[6.5rem]"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-primary/10 to-transparent hover:from-primary/20 hover:bg-transparent hover:text-primary border-l rounded-l-none"
                    onClick={() => setShowAiSubjectGenerator(!showAiSubjectGenerator)}
                  >
                    {showAiSubjectGenerator ? 'Hide AI' : 'AI Assist'}
                  </Button>
                </div>
              </div>
              
              {showAiSubjectGenerator && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-start-2 col-span-3">
                    <SubjectLineGenerator 
                      emailContent={emailForm.content}
                      onSelectSubjectLine={(subjectLine) => {
                        setEmailForm(prev => ({ ...prev, subject: subjectLine }));
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
                  Content:
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={emailForm.content}
                  onChange={handleChange}
                  className="col-span-3 min-h-[200px]"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="senderName" className="text-right">
                  From Name:
                </Label>
                <Input
                  id="senderName"
                  name="senderName"
                  value={emailForm.senderName}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="replyToEmail" className="text-right">
                  Reply-To:
                </Label>
                <Input
                  id="replyToEmail"
                  name="replyToEmail"
                  value={emailForm.replyToEmail}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Emails;