import React from 'react';
import { Link } from 'wouter';
import SendPulseTestForm from '@/components/SendPulseTestForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SendPulseTestPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold ml-4">SendPulse Integration Tester</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <SendPulseTestForm />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-muted/50 p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">About SendPulse Integration</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                This page allows you to test the SendPulse email sending functionality that has been integrated into the InfyMailer platform.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">Required Information:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>User ID</strong> - Your SendPulse account user ID (found in your SendPulse account settings)
                </li>
                <li>
                  <strong>Secret Key</strong> - Your SendPulse API secret key (found in your SendPulse account settings)
                </li>
                <li>
                  <strong>From Email</strong> - The sender's email address (must be validated in your SendPulse account)
                </li>
                <li>
                  <strong>To Email</strong> - The recipient's email address
                </li>
              </ul>
              
              <p>
                Upon submission, a test email will be sent through the SendPulse API integration. You can check your recipient's inbox to verify the email was received correctly.
              </p>
              
              <p>
                For production use, you would typically configure these API credentials in your system settings rather than entering them for each email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendPulseTestPage;