import React, { createContext, useContext, ReactNode } from 'react';
import AIAssistant from '@/components/AIAssistant';

// Context to manage the visibility of the AI Assistant
interface AIAssistantContextType {
  showAssistant: boolean;
  toggleAssistant: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [showAssistant, setShowAssistant] = React.useState(true);

  const toggleAssistant = () => setShowAssistant(prev => !prev);

  return (
    <AIAssistantContext.Provider value={{ showAssistant, toggleAssistant }}>
      {children}
      {showAssistant && <AIAssistant />}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}