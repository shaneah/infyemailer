import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { addMessageToHistory, Message } from '@/utils/ai-assistant-utils';

// Types for the AI Assistant context
interface AIAssistantContextType {
  // State
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  context: string;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  setContext: (context: string) => void;
  clearMessages: () => void;
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  
  // Utility functions
  generateEmailTemplate: (params: EmailTemplateParams) => Promise<string>;
  analyzeSubjectLine: (subjectLine: string) => Promise<SubjectLineAnalysis>;
  getEmailMarketingBestPractices: (topic?: string) => Promise<string[]>;
  suggestEmailImprovements: (emailContent: string) => Promise<EmailImprovements>;
}

// Template generation parameters
export interface EmailTemplateParams {
  subject: string;
  purpose: string;
  audience: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  includeCallToAction?: boolean;
  specialInstructions?: string;
}

// Subject line analysis
export interface SubjectLineAnalysis {
  score: number;
  feedback: string;
  suggestions: string[];
  strength: string;
  weakness: string;
}

// Email improvements
export interface EmailImprovements {
  improvements: string[];
  revisedContent: string;
}

// Create the context with default values
export const AIAssistantContext = createContext<AIAssistantContextType>({
  // Default state
  isOpen: false,
  messages: [],
  isLoading: false,
  context: 'general',
  
  // Default actions (no-ops)
  sendMessage: async () => {},
  setContext: () => {},
  clearMessages: () => {},
  toggleAssistant: () => {},
  openAssistant: () => {},
  closeAssistant: () => {},
  
  // Default utility functions
  generateEmailTemplate: async () => '',
  analyzeSubjectLine: async () => ({ 
    score: 0, 
    feedback: '', 
    suggestions: [], 
    strength: '', 
    weakness: '' 
  }),
  getEmailMarketingBestPractices: async () => [],
  suggestEmailImprovements: async () => ({ improvements: [], revisedContent: '' })
});

// Constants
const STORAGE_KEY = 'aiAssistantMessages';
const STORAGE_CONTEXT_KEY = 'aiAssistantContext';
const MAX_MESSAGES = 50; // Limit to last 50 messages for performance

// Provider component
export const AIAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [context, setContext] = useState<string>('general');
  
  // Load saved messages from localStorage on initial mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      
      const savedContext = localStorage.getItem(STORAGE_CONTEXT_KEY);
      if (savedContext) {
        setContext(savedContext);
      }
    } catch (error) {
      console.error('Error loading saved assistant messages:', error);
    }
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      // Only save if we have messages
      if (messages.length > 0) {
        // Limit to last MAX_MESSAGES for performance
        const messagesToSave = messages.slice(-MAX_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
      }
    } catch (error) {
      console.error('Error saving assistant messages:', error);
    }
  }, [messages]);
  
  // Save context to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONTEXT_KEY, context);
    } catch (error) {
      console.error('Error saving assistant context:', error);
    }
  }, [context]);
  
  // Open the assistant
  const openAssistant = () => setIsOpen(true);
  
  // Close the assistant
  const closeAssistant = () => setIsOpen(false);
  
  // Toggle the assistant
  const toggleAssistant = () => setIsOpen(prev => !prev);
  
  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };
  
  // Set the conversation context
  const updateContext = (newContext: string) => {
    setContext(newContext);
  };
  
  // Send a message to the assistant
  const sendMessage = async (message: string): Promise<void> => {
    if (!message.trim()) return;
    
    // Add user message to state immediately
    const updatedMessages = addMessageToHistory(messages, {
      role: 'user',
      content: message
    });
    setMessages(updatedMessages);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Get only the last 10 messages for context (to limit token usage)
      const recentMessages = updatedMessages.slice(-10);
      
      // Make API request
      const response = await apiRequest('POST', '/api/assistant/chat', {
        message,
        context,
        history: recentMessages
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add assistant response to messages
        setMessages(prevMessages => 
          addMessageToHistory(prevMessages, {
            role: 'assistant',
            content: data.response || 'Sorry, I could not generate a response.'
          })
        );
      } else {
        // Handle error response
        toast({
          title: 'Error from AI Assistant',
          description: data.error || 'Failed to get a response from the assistant.',
          variant: 'destructive'
        });
        
        // Add error message
        setMessages(prevMessages => 
          addMessageToHistory(prevMessages, {
            role: 'assistant',
            content: data.response || 'I encountered an error processing your request. Please try again.'
          })
        );
      }
    } catch (error) {
      console.error('Error sending message to assistant:', error);
      
      // Add error message
      setMessages(prevMessages => 
        addMessageToHistory(prevMessages, {
          role: 'assistant',
          content: 'I encountered a network error. Please check your connection and try again.'
        })
      );
      
      toast({
        title: 'Connection Error',
        description: 'Failed to reach the AI Assistant. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      // Clear loading state
      setIsLoading(false);
    }
  };
  
  // Generate an email template
  const generateEmailTemplate = async (params: EmailTemplateParams): Promise<string> => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', '/api/assistant/generate-template', params);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate template');
      }
      
      return data.template;
    } catch (error) {
      console.error('Error generating email template:', error);
      toast({
        title: 'Template Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error generating template',
        variant: 'destructive'
      });
      return '';
    } finally {
      setIsLoading(false);
    }
  };
  
  // Analyze a subject line
  const analyzeSubjectLine = async (subjectLine: string): Promise<SubjectLineAnalysis> => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', '/api/assistant/analyze-subject', { subjectLine });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze subject line');
      }
      
      return data;
    } catch (error) {
      console.error('Error analyzing subject line:', error);
      toast({
        title: 'Subject Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error analyzing subject line',
        variant: 'destructive'
      });
      return {
        score: 0,
        feedback: 'Analysis failed. Please try again.',
        suggestions: [],
        strength: '',
        weakness: ''
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get email marketing best practices
  const getEmailMarketingBestPractices = async (topic?: string): Promise<string[]> => {
    try {
      setIsLoading(true);
      
      const url = topic 
        ? `/api/assistant/best-practices?topic=${encodeURIComponent(topic)}`
        : '/api/assistant/best-practices';
      
      const response = await apiRequest('GET', url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get best practices');
      }
      
      return data.bestPractices || [];
    } catch (error) {
      console.error('Error getting best practices:', error);
      toast({
        title: 'Failed to Get Best Practices',
        description: error instanceof Error ? error.message : 'Unknown error getting best practices',
        variant: 'destructive'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Suggest improvements for an email
  const suggestEmailImprovements = async (emailContent: string): Promise<EmailImprovements> => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', '/api/assistant/improve-email', { emailContent });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to suggest improvements');
      }
      
      return data;
    } catch (error) {
      console.error('Error suggesting email improvements:', error);
      toast({
        title: 'Failed to Suggest Improvements',
        description: error instanceof Error ? error.message : 'Unknown error suggesting improvements',
        variant: 'destructive'
      });
      return {
        improvements: [],
        revisedContent: ''
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create value object for the context
  const value: AIAssistantContextType = {
    // State
    isOpen,
    messages,
    isLoading,
    context,
    
    // Actions
    sendMessage,
    setContext: updateContext,
    clearMessages,
    toggleAssistant,
    openAssistant,
    closeAssistant,
    
    // Utility functions
    generateEmailTemplate,
    analyzeSubjectLine,
    getEmailMarketingBestPractices,
    suggestEmailImprovements
  };
  
  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};

// Custom hook for using the AI Assistant
export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  
  return context;
};