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
    <Card className={`border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group ${sizeClasses[widget.size]} ${className}`}>
      <CardHeader className={`flex flex-row items-center justify-between pb-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30 ${headerClassName}`}>
        <div className="flex items-center">
          {icon && (
            <div className="h-7 w-7 rounded-sm bg-blue-800 flex items-center justify-center mr-3">
              {icon}
            </div>
          )}
          <CardTitle className="text-sm font-semibold text-slate-700">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center">
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-slate-400 cursor-move mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm p-0">
                  <MoreVertical className="h-4 w-4 text-slate-500" />
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
        </div>
      </CardHeader>
      <CardContent className={`relative ${contentClassName}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl -mt-10 -mr-10 opacity-30"></div>
        {children}
      </CardContent>
    </Card>
  );
};

export default BaseWidget;