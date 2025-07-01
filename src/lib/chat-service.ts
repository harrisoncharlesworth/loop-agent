import { createServerClient } from '@/lib/supabase';
import { Chat, ChatWithMessages, Message, MessageInput, CreateChatRequest, UpdateChatRequest } from '@/lib/types';

export class ChatService {
  private supabase = createServerClient();

  async createChat(userId: string, request: CreateChatRequest = {}): Promise<Chat> {
    const { title = 'New Chat', firstMessage } = request;
    
    const { data: chat, error } = await this.supabase
      .from('chats')
      .insert({
        user_id: userId,
        title,
        preview: firstMessage ? firstMessage.substring(0, 100) : null,
        message_count: firstMessage ? 1 : 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }

    // Add first message if provided
    if (firstMessage) {
      await this.addMessage(chat.id, {
        role: 'user',
        content: firstMessage,
      });
    }

    return this.mapChatFromDb(chat);
  }

  async getChats(userId: string, limit = 50, offset = 0): Promise<Chat[]> {
    const { data: chats, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }

    return chats?.map(this.mapChatFromDb) || [];
  }

  async getChat(chatId: string, userId: string): Promise<ChatWithMessages | null> {
    const { data: chat, error: chatError } = await this.supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();

    if (chatError) {
      if (chatError.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch chat: ${chatError.message}`);
    }

    const { data: messages, error: messagesError } = await this.supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`);
    }

    return {
      ...this.mapChatFromDb(chat),
      messages: messages?.map(this.mapMessageFromDb) || [],
    };
  }

  async updateChat(chatId: string, userId: string, updates: UpdateChatRequest): Promise<Chat> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title) updateData.title = updates.title;
    if (updates.preview !== undefined) updateData.preview = updates.preview;

    const { data: chat, error } = await this.supabase
      .from('chats')
      .update(updateData)
      .eq('id', chatId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chat: ${error.message}`);
    }

    return this.mapChatFromDb(chat);
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete chat: ${error.message}`);
    }
  }

  async addMessage(chatId: string, message: MessageInput): Promise<Message> {
    const { data: newMessage, error: messageError } = await this.supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        role: message.role,
        content: message.content,
        tool_calls: message.toolCalls || null,
      })
      .select()
      .single();

    if (messageError) {
      throw new Error(`Failed to add message: ${messageError.message}`);
    }

    // Update chat's message count, updated_at, and preview
    const preview = message.role === 'user' 
      ? message.content.substring(0, 100)
      : message.content.substring(0, 100);

    await this.supabase
      .from('chats')
      .update({
        message_count: await this.getMessageCount(chatId),
        updated_at: new Date().toISOString(),
        preview,
      })
      .eq('id', chatId);

    return this.mapMessageFromDb(newMessage);
  }

  async getMessages(chatId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return messages?.map(this.mapMessageFromDb) || [];
  }

  async generateChatTitle(chatId: string, firstMessage: string): Promise<string> {
    // This will call your existing chat API to generate a title
    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate title');
      }

      const { title } = await response.json();
      return title || 'New Chat';
    } catch (error) {
      console.error('Failed to generate title:', error);
      return 'New Chat';
    }
  }

  private async getMessageCount(chatId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId);

    if (error) {
      console.error('Failed to get message count:', error);
      return 0;
    }

    return count || 0;
  }

  private mapChatFromDb(dbChat: Record<string, any>): Chat {
    return {
      id: dbChat.id,
      userId: dbChat.user_id,
      title: dbChat.title,
      createdAt: dbChat.created_at,
      updatedAt: dbChat.updated_at,
      preview: dbChat.preview,
      messageCount: dbChat.message_count || 0,
    };
  }

  private mapMessageFromDb(dbMessage: Record<string, any>): Message {
    const createdAt = new Date(dbMessage.created_at);
    return {
      id: dbMessage.id,
      role: dbMessage.role,
      content: dbMessage.content,
      toolCalls: dbMessage.tool_calls,
      toolInvocations: dbMessage.tool_calls, // For UI compatibility
      chatId: dbMessage.chat_id,
      createdAt,
      timestamp: createdAt,
    };
  }
}

export const chatService = new ChatService();
