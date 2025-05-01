import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react';
import { useAIAssistant, ChatMessage } from '../contexts/AIAssistantContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function AIAssistant() {
  const { messages, isOpen, isLoading, openChat, closeChat, sendMessage, clearChat } = useAIAssistant();
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current && !isMinimized) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isMinimized]);

  // Focus input when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date instanceof Date ? date : new Date(date));
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={openChat} 
                className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Open AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col bg-background border border-border rounded-lg shadow-xl transition-all duration-200 ease-in-out",
        isMinimized 
          ? "w-[300px] h-14" 
          : "w-[380px] max-w-[95vw] h-[550px] max-h-[80vh]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-accent/50">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-primary">
            <AvatarImage src="" />
            <AvatarFallback className="text-sm text-primary-foreground">AI</AvatarFallback>
          </Avatar>
          <h3 className="font-medium">Email Marketing Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={toggleMinimize}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-destructive hover:text-destructive" 
            onClick={closeChat}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body - only show when not minimized */}
      {!isMinimized && (
        <>
          <div className="flex-1 relative overflow-hidden" ref={scrollAreaRef}>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input area */}
          <div className="p-3 border-t">
            <form onSubmit={handleSend} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about email marketing..."
                  className="w-full px-3 py-2 bg-accent/50 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                {messages.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={clearChat}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button 
                type="submit" 
                size="icon" 
                disabled={inputValue.trim() === '' || isLoading}
                className="h-10 w-10 rounded-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div 
        className={cn(
          "relative max-w-[85%] rounded-lg px-4 py-2 shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-accent text-accent-foreground rounded-bl-none"
        )}
      >
        <div className="whitespace-pre-wrap break-words text-sm">
          {message.content}
        </div>
        <div className={cn(
          "text-[10px] mt-1 opacity-70 text-right", 
          isUser ? "text-primary-foreground" : "text-muted-foreground"
        )}>
          {message.timestamp instanceof Date 
            ? new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              }).format(message.timestamp)
            : ''}
        </div>
      </div>
    </div>
  );
}