import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, GripVertical, X, Settings, MoreVertical } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BaseWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onConfig?: () => void;
  showSettings?: boolean;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  widget,
  onRemove,
  onConfig,
  showSettings = false,
  children,
  icon,
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  // Size classes mapping
  const sizeClasses = {
    small: '',
    medium: 'col-span-1 md:col-span-1',
    large: 'col-span-1 md:col-span-2',
  };

  return (
    <Card className={`overflow-hidden shadow-sm border border-gray-200 group ${sizeClasses[widget.size]} ${className}`}>
      <CardHeader className={`flex flex-row items-center justify-between pb-2 ${headerClassName}`}>
        <div className="flex items-center">
          {icon && (
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
              {icon}
            </div>
          )}
          <CardTitle className="text-base font-semibold text-purple-800">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full p-0">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {showSettings && onConfig && (
                <>
                  <DropdownMenuItem onClick={onConfig} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configure</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => onRemove(widget.id)} className="cursor-pointer text-red-600">
                <X className="mr-2 h-4 w-4" />
                <span>Remove Widget</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className={`relative ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
};

export default BaseWidget;