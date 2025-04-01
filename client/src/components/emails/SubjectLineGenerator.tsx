import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Email types for the dropdown
const EMAIL_TYPES = [
  'Promotional',
  'Newsletter',
  'Welcome Email',
  'Transactional',
  'Event Invitation',
  'Product Update',
  'Announcement',
  'Follow-up',
  'Re-engagement',
  'Other'
];

interface SubjectLineGeneratorProps {
  emailContent: string;
  onSelectSubjectLine: (subjectLine: string) => void;
}

const SubjectLineGenerator: React.FC<SubjectLineGeneratorProps> = ({ 
  emailContent, 
  onSelectSubjectLine 
}) => {
  const [emailType, setEmailType] = useState<string>('Promotional');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [count, setCount] = useState<number>(5);
  const [generatedSubjectLines, setGeneratedSubjectLines] = useState<string[]>([]);
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/generate-subject-lines', {
        method: 'POST',
        body: JSON.stringify({
          emailContent,
          emailType,
          targetAudience,
          keywords,
          count
        })
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.subjectLines && data.subjectLines.length > 0) {
        setGeneratedSubjectLines(data.subjectLines);
        toast({
          title: 'Success!',
          description: `Generated ${data.subjectLines.length} subject lines`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'No subject lines generated',
          description: 'Try adjusting your parameters and try again',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error generating subject lines',
        description: error.message || 'Please try again with different parameters',
        variant: 'destructive',
      });
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAudience) {
      toast({
        title: 'Missing information',
        description: 'Please describe your target audience',
        variant: 'destructive',
      });
      return;
    }
    mutate();
  };

  const handleSelectSubjectLine = (subjectLine: string) => {
    onSelectSubjectLine(subjectLine);
    toast({
      title: 'Subject line selected',
      description: 'The subject line has been applied to your email',
      variant: 'default',
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        AI Subject Line Generator
      </h3>
      
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email Type</label>
          <select
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
            value={emailType}
            onChange={(e) => setEmailType(e.target.value)}
          >
            {EMAIL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
            placeholder="E.g., Small business owners, Tech enthusiasts, New customers"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Keywords (Optional)</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
            placeholder="E.g., sale, discount, new product, special offer"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Number of Subject Lines</label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors"
          disabled={isPending}
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </div>
          ) : 'Generate Subject Lines'}
        </button>
      </form>
      
      {generatedSubjectLines.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Generated Subject Lines</h4>
          <ul className="space-y-2">
            {generatedSubjectLines.map((subjectLine, index) => (
              <li 
                key={index} 
                className="p-2 border rounded-md hover:bg-gray-50 flex justify-between items-center group cursor-pointer"
                onClick={() => handleSelectSubjectLine(subjectLine)}
              >
                <span>{subjectLine}</span>
                <button
                  className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSubjectLine(subjectLine);
                  }}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubjectLineGenerator;