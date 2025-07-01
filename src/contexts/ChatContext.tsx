'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chat, ChatWithMessages, Message, MessageInput } from '@/lib/types';
import { toast } from 'sonner';

interface ChatContextValue {
  currentChat: ChatWithMessages | null;
  chats: Chat[];
  isLoading: boolean;
  isCreatingChat: boolean;
  createChat: (firstMessage?: string) => Promise<Chat | null>;
  selectChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  addMessage: (message: MessageInput) => Promise<Message | null>;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Load chats on mount
  useEffect(() => {
    refreshChats();
  }, []);

  const refreshChats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async (firstMessage?: string): Promise<Chat | null> => {
    try {
      setIsCreatingChat(true);
      
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstMessage,
          title: firstMessage ? undefined : 'New Chat'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data = await response.json();
      const newChat = data.chat;

      // Add to chats list
      setChats(prev => [newChat, ...prev]);
      
      // Generate title if we have a first message
      if (firstMessage) {
        generateAndUpdateTitle(newChat.id, firstMessage);
      }

      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      return null;
    } finally {
      setIsCreatingChat(false);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/chats/${chatId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }

      const data = await response.json();
      setCurrentChat(data.chat);
    } catch (error) {
      console.error('Error selecting chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      // Remove from chats list
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // Clear current chat if it was deleted
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat title');
      }

      const data = await response.json();
      const updatedChat = data.chat;

      // Update in chats list
      setChats(prev => 
        prev.map(chat => chat.id === chatId ? updatedChat : chat)
      );

      // Update current chat if needed
      if (currentChat?.id === chatId) {
        setCurrentChat(prev => prev ? { ...prev, title: updatedChat.title } : null);
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to update chat title');
    }
  };

  const addMessage = async (message: MessageInput): Promise<Message | null> => {
    if (!currentChat) return null;

    try {
      const response = await fetch(`/api/chats/${currentChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('Failed to add message');
      }

      const data = await response.json();
      const newMessage = data.message;

      // Add message to current chat
      setCurrentChat(prev => 
        prev ? { 
          ...prev, 
          messages: [...prev.messages, newMessage],
          messageCount: prev.messageCount + 1
        } : null
      );

      // Update chat in list with new preview and message count
      setChats(prev => 
        prev.map(chat => 
          chat.id === currentChat.id 
            ? { 
                ...chat, 
                preview: message.content.substring(0, 100),
                messageCount: chat.messageCount + 1,
                updatedAt: new Date().toISOString()
              }
            : chat
        )
      );

      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error('Failed to save message');
      return null;
    }
  };

  const generateAndUpdateTitle = async (chatId: string, firstMessage: string) => {
    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstMessage }),
      });

      if (response.ok) {
        const { title } = await response.json();
        if (title && title !== 'New Chat') {
          await updateChatTitle(chatId, title);
        }
      }
    } catch (error) {
      console.error('Error generating title:', error);
      // Fail silently - title generation is not critical
    }
  };

  const value: ChatContextValue = {
    currentChat,
    chats,
    isLoading,
    isCreatingChat,
    createChat,
    selectChat,
    deleteChat,
    updateChatTitle,
    addMessage,
    refreshChats,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
