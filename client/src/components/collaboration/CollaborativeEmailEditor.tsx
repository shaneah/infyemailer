import React, { useState, useEffect, useRef } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import EmailEditor from '@/components/EmailEditor';
import { CollaborationPanel } from './CollaborationPanel';
import { CollaborationCursor } from './CollaborationCursor';
import { CollaborationSelection } from './CollaborationSelection';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface CollaborativeEmailEditorProps {
  templateId: string | number;
  initialTemplate?: any;
  onSave?: (template: any) => void;
  readOnly?: boolean;
  username?: string;
  avatar?: string;
}

export function CollaborativeEmailEditor({
  templateId,
  initialTemplate,
  onSave,
  readOnly = false,
  username = 'Anonymous User',
  avatar,
}: CollaborativeEmailEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef(null);
  
  // Generate a persistent user ID for this session if not already available
  const [userId] = useState(() => {
    const storedId = sessionStorage.getItem('collaboration_user_id');
    if (storedId) return storedId;
    
    const newId = uuidv4();
    sessionStorage.setItem('collaboration_user_id', newId);
    return newId;
  });
  
  // Track mouse position for sharing cursor location
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Current template state
  const [template, setTemplate] = useState(initialTemplate || {});
  
  // Track active element for selection
  const [activeElement, setActiveElement] = useState<{
    id: string;
    selection?: { start: number; end: number };
  } | null>(null);

  // Initialize collaboration hook
  const {
    isConnected,
    isReconnecting,
    users,
    cursorPositions,
    updateCursorPosition,
    sendTemplateChange,
    setOnTemplateChange,
  } = useCollaboration({
    templateId,
    userId,
    username,
    avatar,
  });

  // Set up template change handler
  useEffect(() => {
    setOnTemplateChange((user, change) => {
      // Apply changes from other users to the local template
      try {
        // TemplateChange has the change data directly
        if (!change) return;
        
        switch (change.type) {
          case 'add':
            // Handle add operation
            console.log('Collaboration: Add operation from', user.username);
            // This would need to be handled based on your template structure
            break;
            
          case 'update':
            // Handle update operation
            console.log('Collaboration: Update operation from', user.username);
            // This would need to be handled based on your template structure
            break;
            
          case 'delete':
            // Handle delete operation
            console.log('Collaboration: Delete operation from', user.username);
            // This would need to be handled based on your template structure
            break;
            
          case 'move':
            // Handle move operation
            console.log('Collaboration: Move operation from', user.username);
            // This would need to be handled based on your template structure
            break;
        }
        
        // Show toast for collaboration changes
        toast({
          title: `${user.username} made changes`,
          description: `Updated ${change.targetType}`,
          variant: 'default',
        });
      } catch (error) {
        console.error('Failed to apply template change:', error);
      }
    });
  }, [setOnTemplateChange, toast]);

  // Track mouse position for sharing cursor
  useEffect(() => {
    if (readOnly) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const throttledUpdate = throttle((position: { x: number, y: number }) => {
      // Only send cursor updates if connected and in editor area
      if (isConnected && editorRef.current) {
        const editorElement = editorRef.current as HTMLElement;
        const rect = editorElement.getBoundingClientRect();
        
        // Check if cursor is inside editor area
        if (
          position.x >= rect.left &&
          position.x <= rect.right &&
          position.y >= rect.top &&
          position.y <= rect.bottom
        ) {
          // Convert to relative position within editor
          const relativeX = position.x - rect.left;
          const relativeY = position.y - rect.top;
          
          // Send cursor update
          updateCursorPosition({
            position: { x: relativeX, y: relativeY },
            elementId: activeElement?.id,
            selection: activeElement?.selection,
          });
        }
      }
    }, 50);
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Watch mouse position and send updates
    const interval = setInterval(() => {
      throttledUpdate(mousePosition);
    }, 100);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [isConnected, mousePosition, activeElement, updateCursorPosition, readOnly]);

  // Handle template changes
  const handleTemplateChange = (newTemplate: any, changeType: 'add' | 'update' | 'delete' | 'move', targetType: 'section' | 'element' | 'template', targetId?: string, parentId?: string) => {
    if (readOnly) return;
    
    // Update local state
    setTemplate(newTemplate);
    
    // Send change to collaboration service
    if (isConnected) {
      sendTemplateChange({
        type: changeType,
        targetType,
        targetId,
        parentId,
        data: newTemplate,
      });
    }
    
    // Call onSave handler if provided
    if (onSave) {
      onSave(newTemplate);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1" ref={editorRef}>
        {/* Original EmailEditor component */}
        <EmailEditor 
          initialTemplate={template}
          onTemplateChange={(newTemplate, type, targetType, targetId, parentId) => {
            handleTemplateChange(newTemplate, 
              type as 'add' | 'update' | 'delete' | 'move', 
              targetType as 'section' | 'element' | 'template',
              targetId, 
              parentId
            );
          }}
          onElementFocus={(elementId, selection) => {
            setActiveElement({ id: elementId, selection });
            if (isConnected) {
              updateCursorPosition({ elementId, selection });
            }
          }}
          readOnly={readOnly}
        />
        
        {/* Collaboration cursors overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Render other users' cursors */}
          {Object.values(cursorPositions).map((cursor) => {
            // Find user data for this cursor
            const user = users.find(u => u.id === cursor.userId);
            if (!user || user.isCurrentUser) return null;
            
            return (
              <React.Fragment key={cursor.userId}>
                {cursor.position && (
                  <CollaborationCursor 
                    username={user.username}
                    color={user.color}
                    position={cursor.position}
                    isActive={true}
                  />
                )}
                
                {cursor.elementId && cursor.selection && (
                  <CollaborationSelection
                    username={user.username}
                    color={user.color}
                    elementId={cursor.elementId}
                    selection={cursor.selection}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Collaboration panel */}
      <div className="w-52 shrink-0">
        <CollaborationPanel 
          users={users}
          isConnected={isConnected}
          isReconnecting={isReconnecting}
        />
      </div>
    </div>
  );
}

// Utility function for throttling frequent updates
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}