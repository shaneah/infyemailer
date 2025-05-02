import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  ChatMessage, 
  sendChatMessage, 
  formatTimestamp, 
  getSuggestedMessages 
} from '@/utils/ai-assistant-utils';

// Create the context type
interface AIAssistantContextType {
  isOpen: boolean;
  toggleAssistant: () => void;
  chatHistory: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  isLoading: boolean;
  context: string;
  setContext: (context: string) => void;
  suggestedMessages: string[];
  minimized: boolean;
  toggleMinimize: () => void;
}

// Create the context with a default value
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Local storage key for persisting chat history
const CHAT_HISTORY_KEY = 'ai_assistant_chat_history';
const CHAT_CONTEXT_KEY = 'ai_assistant_context';

// Props for the context provider
interface AIAssistantProviderProps {
  children: React.ReactNode;
}

// Create the provider component
export function AIAssistantProvider({ children }: AIAssistantProviderProps) {
  // State for tracking if the assistant is open
  const [isOpen, setIsOpen] = useState(false);
  // State for tracking if the assistant is minimized
  const [minimized, setMinimized] = useState(false);
  // State for chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  // State for the assistant context
  const [context, setContext] = useState<string>('general');
  // State for suggested messages
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(getSuggestedMessages('general'));
  
  const { toast } = useToast();
  
  // Load chat history from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      } else {
        // Add welcome message if no history exists
        setChatHistory([
          {
            role: 'assistant',
            content: "👋 Hello! I'm your AI email marketing assistant. How can I help you today?"
          }
        ]);
      }
      
      const savedContext = localStorage.getItem(CHAT_CONTEXT_KEY);
      if (savedContext) {
        setContext(savedContext);
        setSuggestedMessages(getSuggestedMessages(savedContext));
      }
    } catch (error) {
      console.error('Error loading chat history from localStorage:', error);
    }
  }, []);
  
  // Save chat history to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
    }
  }, [chatHistory]);
  
  // Save context to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_CONTEXT_KEY, context);
      setSuggestedMessages(getSuggestedMessages(context));
    } catch (error) {
      console.error('Error saving chat context to localStorage:', error);
    }
  }, [context]);
  
  // Function to toggle the assistant
  const toggleAssistant = () => {
    setIsOpen(prev => !prev);
    if (minimized) {
      setMinimized(false);
    }
  };
  
  // Function to toggle minimize state
  const toggleMinimize = () => {
    setMinimized(prev => !prev);
  };
  
  // Function to send a message
  const sendMessage = async (message: string) => {
    try {
      // Add user message to chat history
      const userMessage: ChatMessage = {
        role: 'user',
        content: message
      };
      
      // Get formatted history for the API (excluding the current message)
      const historyForAPI = chatHistory.map(({ role, content }) => ({ role, content }));
      
      // Update UI immediately with user message
      setChatHistory(prev => [...prev, userMessage]);
      
      // Show loading indicator
      setIsLoading(true);
      
      // Send message to API
      const response = await sendChatMessage(message, context, historyForAPI);
      
      // Update chat history with assistant response
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.message
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, but I encountered an error. Please try again later."
        }
      ]);
      
      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to get response from assistant.',
        variant: 'destructive'
      });
    } finally {
      // Hide loading indicator
      setIsLoading(false);
    }
  };
  
  // Function to clear chat history
  const clearHistory = () => {
    // Keep only the welcome message
    setChatHistory([
      {
        role: 'assistant',
        content: "👋 Hello! I'm your AI email marketing assistant. How can I help you today?"
      }
    ]);
    
    toast({
      title: 'Chat History Cleared',
      description: 'Your conversation history has been reset.'
    });
  };
  
  // Create the context value
  const contextValue: AIAssistantContextType = {
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
    toggleMinimize
  };
  
  // Return the provider with the context value
  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  );
}

// Create a custom hook for using the context
export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  
  return context;
}