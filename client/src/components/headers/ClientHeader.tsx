import React, { ReactNode } from 'react';
import {
  ChevronLeft
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClientHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  backPath?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export default function ClientHeader({
  title,
  description,
  icon,
  backPath,
  backLabel = 'Back',
  actions,
  className
}: ClientHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {backPath && (
        <div className="mb-4">
          <Link to={backPath}>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-800 -ml-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backLabel}
            </Button>
          </Link>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-1 p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              {icon}
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}