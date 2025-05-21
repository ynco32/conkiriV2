'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import ChatbotOverlay from '../ChatbotOverlay/ChatbotOverlay';

interface ChatbotContextProps {
  openChatbot: () => void;
  closeChatbot: () => void;
  isChatbotOpen: boolean;
}

const ChatbotContext = createContext<ChatbotContextProps | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
}

export default function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openChatbot = () => setIsOpen(true);
  const closeChatbot = () => setIsOpen(false);

  return (
    <ChatbotContext.Provider value={{ openChatbot, closeChatbot, isChatbotOpen: isOpen }}>
      {children}
      <ChatbotOverlay isOpen={isOpen} onClose={closeChatbot} />
    </ChatbotContext.Provider>
  );
}