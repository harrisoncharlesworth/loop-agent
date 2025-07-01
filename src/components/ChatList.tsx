'use client';

import { useChatContext } from '@/contexts/ChatContext';
import { ChatListItem } from './ChatListItem';
import { NewChatButton } from './NewChatButton';
import { Skeleton } from '@/components/ui/skeleton';

export function ChatList() {
  const { chats, isLoading } = useChatContext();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <NewChatButton />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <NewChatButton />
      
      {chats.length === 0 ? (
        <div className="text-center text-sidebar-muted-foreground text-sm py-8">
          No chats yet. Create your first chat to get started!
        </div>
      ) : (
        <div className="space-y-1">
          {chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
        </div>
      )}
    </div>
  );
}
