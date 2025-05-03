import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X,
  Send,
  Trash2,
  Bot,
  Minimize2,
  Maximize2,
  Sparkles,
  Menu,
  Loader2,
} from 'lucide-react';
import { formatTimestamp } from '@/utils/ai-assistant-utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Helper function to format message text with line breaks and links
function formatMessageText(text: string): React.ReactNode {
  // Split by line breaks
  const parts = text.split('\n');
  
  // Create an array to hold formatted parts
  const formattedParts: React.ReactNode[] = [];
  
  // Process each part
  parts.forEach((part, index) => {
    // Add previous parts with line breaks
    if (index > 0) {
      formattedParts.push(<br key={`br-${index}`} />);
    }
    
    // Check for links and format them
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const segments = part.split(linkRegex);
    
    // Process each segment
    segments.forEach((segment, segmentIndex) => {
      if (segment.match(linkRegex)) {
        // This is a link
        formattedParts.push(
          <a 
            key={`link-${index}-${segmentIndex}`}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {segment}
          </a>
        );
      } else if (segment) {
        // This is regular text
        formattedParts.push(
          <span key={`text-${index}-${segmentIndex}`}>{segment}</span>
        );
      }
    });
  });
  
  return <>{formattedParts}</>;
}

// Message component to display a single chat message
const Message: React.FC<{
  content: string;
  isUser: boolean;
  timestamp?: Date;
}> = ({ content, isUser, timestamp }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`p-3 rounded-lg max-w-[75%] ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted text-foreground rounded-tl-none'
        }`}
      >
        <div className="text-sm">{formatMessageText(content)}</div>
        {timestamp && (
          <div className="text-xs opacity-70 mt-1 text-right">
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

// Suggested message component
const SuggestedMessage: React.FC<{
  message: string;
  onSelect: (message: string) => void;
}> = ({ message, onSelect }) => {
  return (
    <Button
      variant="outline"
      className="mr-2 mb-2 text-sm whitespace-normal h-auto py-1.5"
      onClick={() => onSelect(message)}
    >
      {message}
    </Button>
  );
};

// Main AI Assistant component
export const AIAssistant: React.FC = () => {
  const {
    isOpen,
    toggleAssistant,
    chatHistory,
    sendMessage,
    clearHistory,
    isLoading,
    context,
    setContext,
    suggestedMessages,
    minimized,
    toggleMinimize,
  } = useAIAssistant();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !minimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen, minimized]);
  
  // Auto-focus input when opening the assistant
  useEffect(() => {
    if (isOpen && !minimized && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, minimized]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };
  
  // Handle key press in textarea
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Handle selecting a suggested message
  const handleSuggestedMessageClick = (message: string) => {
    sendMessage(message);
  };
  
  // Handle context change
  const handleContextChange = (value: string) => {
    setContext(value);
  };
  
  // If the assistant is not open, don't render anything
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col shadow-lg rounded-lg">
      <Card className={`w-[360px] ${minimized ? 'h-auto' : 'h-[500px]'} flex flex-col bg-card`}>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            <CardTitle className="text-lg font-medium">AI Assistant</CardTitle>
            {context !== 'general' && (
              <Badge variant="outline" className="ml-2">
                {context.replace('_', ' ')}
              </Badge>
            )}
          </div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleMinimize}
                  >
                    {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{minimized ? 'Maximize' : 'Minimize'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleAssistant}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        {!minimized && (
          <>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <Select value={context} onValueChange={handleContextChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Help</SelectItem>
                    <SelectItem value="email_marketing">Email Marketing</SelectItem>
                    <SelectItem value="template_design">Template Design</SelectItem>
                    <SelectItem value="campaign_strategy">Campaign Strategy</SelectItem>
                  </SelectContent>
                </Select>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={clearHistory}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-4">
                {chatHistory.map((message, index) => (
                  <Message
                    key={index}
                    content={message.content}
                    isUser={message.role === 'user'}
                    timestamp={new Date()}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="p-3 rounded-lg bg-muted text-muted-foreground rounded-tl-none">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {suggestedMessages.length > 0 && chatHistory.length <= 2 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap">
                    {suggestedMessages.map((msg, index) => (
                      <SuggestedMessage
                        key={index}
                        message={msg}
                        onSelect={handleSuggestedMessageClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-3 border-t">
              <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-10 max-h-32 resize-none"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

// Toggle button for opening the assistant
export const AIAssistantButton: React.FC = () => {
  const { toggleAssistant, isOpen } = useAIAssistant();
  
  // Enhanced event handler to ensure the toggle action works
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAssistant();
    console.log("AI Assistant button clicked, isOpen:", !isOpen); // Debugging log
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleClick}
              variant="default"
              size="icon"
              className="rounded-full h-12 w-12 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0"
              aria-label="Open AI Assistant"
              data-state={isOpen ? 'open' : 'closed'}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};