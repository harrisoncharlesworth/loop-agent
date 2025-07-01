'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';

export function NewChatButton() {
  const { createChat, isCreatingChat } = useChatContext();
  const router = useRouter();

  const handleNewChat = async () => {
    const newChat = await createChat();
    if (newChat) {
      router.push(`/chat/${newChat.id}`);
    }
  };

  return (
    <Button
      onClick={handleNewChat}
      disabled={isCreatingChat}
      className="w-full justify-start"
      variant="outline"
    >
      <Plus className="h-4 w-4 mr-2" />
      {isCreatingChat ? 'Creating...' : 'New Chat'}
    </Button>
  );
}
