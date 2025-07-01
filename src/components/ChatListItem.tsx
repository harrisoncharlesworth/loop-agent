'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { Chat } from '@/lib/types';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatListItemProps {
  chat: Chat;
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const { deleteChat, updateChatTitle } = useChatContext();
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isDeleting, setIsDeleting] = useState(false);

  const isActive = pathname === `/chat/${chat.id}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    setIsDeleting(true);
    await deleteChat(chat.id);
    setIsDeleting(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      await updateChatTitle(chat.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(chat.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
        <MessageSquare className="h-4 w-4 text-sidebar-muted-foreground flex-shrink-0" />
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-8 text-sm"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSaveTitle}
          className="h-6 w-6 p-0"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancelEdit}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Link href={`/chat/${chat.id}`} className="block">
      <div
        className={cn(
          "group flex items-start gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors",
          isActive && "bg-sidebar-accent"
        )}
      >
        <MessageSquare className="h-4 w-4 text-sidebar-muted-foreground flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm truncate">
              {chat.title}
            </h3>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {chat.preview && (
            <p className="text-xs text-sidebar-muted-foreground truncate mt-1">
              {chat.preview}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-sidebar-muted-foreground">
              {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
            </span>
            {chat.messageCount > 0 && (
              <span className="text-xs text-sidebar-muted-foreground">
                {chat.messageCount} message{chat.messageCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
