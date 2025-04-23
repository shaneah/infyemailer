import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserMinus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CollaborationUser {
  id: string;
  username: string;
  avatar?: string;
  color: string;
  isCurrentUser?: boolean;
}

interface CollaborationPanelProps {
  users: CollaborationUser[];
  isConnected: boolean;
  isReconnecting: boolean;
}

/**
 * Panel showing active collaborators in the template editor
 */
export function CollaborationPanel({ 
  users, 
  isConnected, 
  isReconnecting 
}: CollaborationPanelProps) {
  const activeUsers = users.filter(user => !user.isCurrentUser);
  
  return (
    <div className="flex flex-col gap-2 p-3 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Users size={16} /> 
          <span>Collaborators</span>
          <Badge variant={isConnected ? "success" : isReconnecting ? "warning" : "destructive"} className="ml-1 h-5 text-xs">
            {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}
          </Badge>
        </h3>
      </div>

      <div className="space-y-2">
        {activeUsers.length > 0 ? (
          activeUsers.map(user => (
            <div 
              key={user.id} 
              className="flex items-center gap-2 p-1.5 rounded-md transition-colors hover:bg-slate-50"
            >
              <div className="relative">
                <Avatar className="h-7 w-7 border-2" style={{ borderColor: user.color }}>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.username} />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div 
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"
                  aria-hidden="true"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: user.color }}>
                  {user.username}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Online
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-3 text-center text-sm text-slate-500">
            <UserMinus size={24} className="mb-1 text-slate-400" />
            <p>No one else is editing right now</p>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t text-xs text-slate-500">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1 text-xs">
              <UserCheck size={12} />
              <span>Changes saved automatically</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>All edits are synchronized in real-time</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}