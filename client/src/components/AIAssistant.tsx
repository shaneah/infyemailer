import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { 
  formatMessageTime, 
  groupMessagesByDate, 
  getSuggestionsByContext,
  parseMessageContent
} from '@/utils/ai-assistant-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  MessageSquare, 
  X, 
  Send, 
  Trash2, 
  Loader2, 
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';

/**
 * AI Assistant component that provides a chat interface
 */
export function AIAssistant() {
  const { 
    isOpen, 
    messages, 
    isLoading, 
    context,
    sendMessage, 
    setContext, 
    clearMessages, 
    toggleAssistant, 
    closeAssistant 
  } = useAIAssistant();
  
  // Local state
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      sendMessage(suggestion);
    }
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  // Message groups by date
  const messageGroups = groupMessagesByDate(messages);
  
  // Get suggestions based on context
  const suggestions = getSuggestionsByContext(context);
  
  // Render nothing if assistant is closed
  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleAssistant}
              className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
              size="icon"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Open AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div 
      className={`fixed ${
        isExpanded ? 'inset-0 m-4' : 'bottom-4 right-4 w-80 h-96'
      } bg-background border rounded-lg shadow-lg flex flex-col z-50 transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleExpanded}
            className="h-8 w-8"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeAssistant}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Context Selector */}
      <div className="px-3 py-2 border-b">
        <Select value={context} onValueChange={setContext}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Email Marketing</SelectItem>
            <SelectItem value="templates">Email Templates</SelectItem>
            <SelectItem value="analytics">Analytics & Metrics</SelectItem>
            <SelectItem value="deliverability">Email Deliverability</SelectItem>
            <SelectItem value="segmentation">List Segmentation</SelectItem>
            <SelectItem value="compliance">Legal & Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2" />
            <h4 className="text-sm font-medium mb-1">AI Email Marketing Assistant</h4>
            <p className="text-xs max-w-[250px]">
              Ask me anything about email marketing, templates, best practices, or optimization tips.
            </p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                  {date}
                </span>
              </div>
              
              {dateMessages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: parseMessageContent(message.content) 
                      }}
                    />
                    <div className="text-right mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp && formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {messages.length > 0 && !isLoading && (
        <div className="px-3 py-2 border-t">
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            placeholder="Ask me anything about email marketing..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="min-h-[60px] max-h-[120px]"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearMessages}
            disabled={messages.length === 0 || isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * AI Assistant Button that triggers a sheet on mobile
 * and renders the assistant directly on larger screens
 */
export function AIAssistantButton() {
  const { toggleAssistant, isOpen } = useAIAssistant();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle>AI Assistant</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <AIAssistantMobile />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <>
      <AIAssistant />
      {!isOpen && (
        <Button
          onClick={toggleAssistant}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}

/**
 * Mobile-optimized version of the AI Assistant
 * (stripped down for use in the sheet)
 */
function AIAssistantMobile() {
  const { 
    messages, 
    isLoading, 
    context,
    sendMessage, 
    setContext, 
    clearMessages
  } = useAIAssistant();
  
  // Local state
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      sendMessage(suggestion);
    }
  };
  
  // Message groups by date
  const messageGroups = groupMessagesByDate(messages);
  
  // Get suggestions based on context
  const suggestions = getSuggestionsByContext(context);
  
  return (
    <div className="flex flex-col h-full">
      {/* Context Selector */}
      <div className="px-4 py-2 border-b">
        <Select value={context} onValueChange={setContext}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Email Marketing</SelectItem>
            <SelectItem value="templates">Email Templates</SelectItem>
            <SelectItem value="analytics">Analytics & Metrics</SelectItem>
            <SelectItem value="deliverability">Email Deliverability</SelectItem>
            <SelectItem value="segmentation">List Segmentation</SelectItem>
            <SelectItem value="compliance">Legal & Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2" />
            <h4 className="text-sm font-medium mb-1">AI Email Marketing Assistant</h4>
            <p className="text-xs max-w-[250px]">
              Ask me anything about email marketing, templates, best practices, or optimization tips.
            </p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                  {date}
                </span>
              </div>
              
              {dateMessages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: parseMessageContent(message.content) 
                      }}
                    />
                    <div className="text-right mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp && formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t">
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Controls and clear button */}
      <div className="px-4 py-2 border-t flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={clearMessages}
          disabled={messages.length === 0 || isLoading}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear chat
        </Button>
        
        {isLoading && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            placeholder="Ask me anything about email marketing..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputValue.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}