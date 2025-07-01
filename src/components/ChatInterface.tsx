'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chat } from '@/components/ui/chat';
import { type Message as UIMessage } from '@/components/ui/chat-message';
import { type Message } from '@/lib/types';
import { useChatContext } from '@/contexts/ChatContext';

interface ChatInterfaceProps {
  chatId?: string;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { currentChat, selectChat, createChat, addMessage } = useChatContext();
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  // Load chat when chatId changes
  useEffect(() => {
    if (chatId && chatId !== currentChat?.id) {
      selectChat(chatId);
    }
  }, [chatId, currentChat?.id, selectChat]);

  // Convert messages to UI format
  const messages: UIMessage[] = (currentChat?.messages || [
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you with files, system tasks, web searches, and more. What would you like me to help you with?",
      createdAt: new Date(),
    }
  ]).map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt || msg.timestamp,
    toolInvocations: msg.toolCalls?.map(tc => ({
      state: 'result' as const,
      toolName: tc.name,
      result: { output: tc.output, error: tc.error }
    }))
  }));

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    let currentChatId = currentChat?.id;

    // If no current chat, create one first
    if (!currentChatId) {
      const newChat = await createChat(input.trim());
      if (!newChat) {
        return; // Failed to create chat
      }
      currentChatId = newChat.id;
      router.push(`/chat/${newChat.id}`);
    }

    // Add user message to current chat
    await addMessage({
      role: userMessage.role,
      content: userMessage.content,
      toolCalls: userMessage.toolCalls,
    });
    setInput('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message to current chat
      await addMessage({
        role: 'assistant',
        content: data.message.content,
        toolCalls: data.message.toolCalls,
      });
    } catch (error: unknown) {
      await addMessage({
        role: 'assistant',
        content: `Error: ${(error as Error).message}. Please make sure your ANTHROPIC_API_KEY is set in the .env.local file.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleStop = () => {
    setIsGenerating(false);
  };

  return (
    <div className="h-full">
      <Chat
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isGenerating}
        stop={handleStop}
        className="h-full"
      />
    </div>
  );
}
