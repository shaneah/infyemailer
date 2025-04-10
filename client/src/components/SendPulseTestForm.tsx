import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SendPulseTestForm = () => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    userId: '',
    secret: '',
    from: '',
    to: '',
    subject: 'SendPulse Test Email',
    text: 'This is a test email sent from the InfyMailer platform using SendPulse API.',
    html: '<h1>SendPulse Test</h1><p>This is a test email sent from the <b>InfyMailer</b> platform using SendPulse API.</p>'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.secret || !formData.from || !formData.to) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/email/test-sendpulse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Email sent successfully',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || data.message || 'Failed to send email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-gold/30 shadow-gold/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Test SendPulse Integration</CardTitle>
        <CardDescription>
          Fill in the fields below to test sending an email using the SendPulse API
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID <span className="text-red-500">*</span></Label>
            <Input
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="Your SendPulse User ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secret">Secret Key <span className="text-red-500">*</span></Label>
            <Input
              id="secret"
              name="secret"
              type="password"
              value={formData.secret}
              onChange={handleChange}
              placeholder="Your SendPulse Secret Key"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from">From Email <span className="text-red-500">*</span></Label>
            <Input
              id="from"
              name="from"
              type="email"
              value={formData.from}
              onChange={handleChange}
              placeholder="sender@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="to">To Email <span className="text-red-500">*</span></Label>
            <Input
              id="to"
              name="to"
              type="email"
              value={formData.to}
              onChange={handleChange}
              placeholder="recipient@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Email Subject"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text">Plain Text Content</Label>
            <Textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Plain text email content"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="html">HTML Content</Label>
            <Textarea
              id="html"
              name="html"
              value={formData.html}
              onChange={handleChange}
              placeholder="HTML email content"
              rows={6}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test Email'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SendPulseTestForm;