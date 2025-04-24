import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Loader2, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface MessageType {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([
    { 
      role: 'assistant', 
      content: 'Hi there! I\'m your email marketing assistant. How can I help you today? I can provide tips on crafting effective subject lines, suggest campaign ideas, help with email content, or answer questions about marketing best practices.' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toggleAssistant } = useAIAssistant();
  const { toast } = useToast();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    const userMessage = { role: 'user' as const, content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          context: 'email_marketing' 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message to assistant:', error);
      toast({
        title: 'Communication Error',
        description: 'Could not connect to the AI assistant. Using fallback mode.',
        variant: 'destructive',
      });
      
      // Fallback response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting to my knowledge base right now. Here are some general email marketing tips: Write clear subject lines, segment your audience, use mobile-friendly templates, include a single call-to-action, and always test before sending. How else can I help you?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <div className="relative flex flex-col">
          <Button 
            className="rounded-full w-12 h-12 shadow-lg hover:bg-primary/90 p-3"
            onClick={toggleExpand}
          >
            <MessageCircle size={24} />
          </Button>
        </div>
      ) : (
        <Card className="w-80 md:w-96 shadow-xl border-primary/20">
          <CardHeader className="p-3 border-b flex flex-row justify-between items-center">
            <div className="font-medium flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-primary" />
              AI Marketing Assistant
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0" 
                onClick={toggleExpand}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" 
                onClick={toggleAssistant}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-4' 
                        : 'bg-muted text-muted-foreground mr-4'
                    }`}
                  >
                    {message.role === 'user' && (
                      <div className="font-semibold text-xs mb-1">You</div>
                    )}
                    {message.role === 'assistant' && (
                      <div className="font-semibold text-xs mb-1">Assistant</div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted text-muted-foreground mr-4">
                    <div className="font-semibold text-xs mb-1">Assistant</div>
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-2 border-t">
            <div className="relative w-full flex">
              <Textarea
                className="min-h-[60px] resize-none pr-12 flex-grow"
                placeholder="Type your message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <Button 
                size="icon" 
                className="absolute right-1 bottom-1 h-8 w-8"
                onClick={sendMessage}
                disabled={isLoading || inputValue.trim() === ''}
              >
                <CornerDownRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;