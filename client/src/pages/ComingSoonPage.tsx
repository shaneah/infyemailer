import React from 'react';
import { useLocation } from 'wouter';
import { BarChart3, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ComingSoonPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  returnPath?: string;
  returnLabel?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available in a future update.",
  icon = <BarChart3 className="h-16 w-16 text-primary mb-4" />,
  returnPath = "/client-dashboard",
  returnLabel = "Return to Dashboard"
}) => {
  const [, navigate] = useLocation();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-500 mb-8">{description}</p>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            {icon}
            <h2 className="text-xl font-semibold mb-2">We're working on something amazing</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Our team is currently building this feature to help you gain more insights and improve your marketing efforts.
              We'll notify you as soon as it's ready.
            </p>
            <Button 
              onClick={() => navigate(returnPath)} 
              className="px-4 py-2"
            >
              {returnLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ReportingComingSoon = () => (
  <ComingSoonPage 
    title="Reporting Dashboard"
    description="Our comprehensive reporting dashboard is currently under development."
    icon={<BarChart3 className="h-16 w-16 text-primary mb-4" />}
  />
);

export const CalendarComingSoon = () => (
  <ComingSoonPage 
    title="Campaign Calendar"
    description="The campaign scheduling calendar is currently under development."
    icon={<Calendar className="h-16 w-16 text-primary mb-4" />}
  />
);

export const DocumentationComingSoon = () => (
  <ComingSoonPage 
    title="Documentation Center"
    description="Our comprehensive knowledge base and documentation is being built."
    icon={<FileText className="h-16 w-16 text-primary mb-4" />}
  />
);

export default ComingSoonPage;