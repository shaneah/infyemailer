import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Users, 
  FileText, 
  BarChart,
} from "lucide-react";

interface QuickActionsProps {
  onCreateEmail: () => void;
}

const QuickActions = ({ onCreateEmail }: QuickActionsProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow transition-shadow h-full">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Create Email</h4>
            <p className="text-muted-foreground text-sm mb-4">Design and send a one-time email to your subscribers.</p>
            <Button 
              className="w-full"
              onClick={onCreateEmail}
            >
              Create Email
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow h-full">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Add Contacts</h4>
            <p className="text-muted-foreground text-sm mb-4">Import or manually add new contacts to your lists.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contacts">
                Manage Contacts
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow h-full">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Templates</h4>
            <p className="text-muted-foreground text-sm mb-4">Create or modify email templates for campaigns.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/templates">
                View Templates
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow transition-shadow h-full">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-100 mb-4">
              <BarChart className="h-6 w-6 text-amber-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Reports</h4>
            <p className="text-muted-foreground text-sm mb-4">View detailed analytics and campaign reports.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/analytics">
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickActions;
