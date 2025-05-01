import React, { createContext, useState, useContext, ReactNode } from 'react';
import { apiRequest } from '../lib/queryClient';

// Define the shape of a chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Define the state and functions our context will provide
interface AIAssistantContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

// Create the context with a default undefined value
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Create a provider component
export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initial welcome message
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! I\'m your email marketing assistant. How can I help you today?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat history cleared! How else can I help you?',
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = async (content: string) => {
    try {
      // First add the user message to the chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      
      // Make API request to the backend
      const response = await apiRequest('POST', '/api/ai-assistant/chat', {
        message: content,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      });
      
      // Get the response from the AI
      const data = await response.json();
      
      // Add the AI response to the chat
      setMessages((prev) => [
        ...prev, 
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response || "I'm sorry, I couldn't process your request.",
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      
      // Add an error message
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the context value
  const contextValue: AIAssistantContextType = {
    messages,
    isOpen,
    isLoading,
    openChat,
    closeChat,
    sendMessage,
    clearChat,
  };

  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  );
}

// Create a custom hook to use the AI Assistant context
export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}