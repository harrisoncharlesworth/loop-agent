import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';
import { MessageInput } from '@/lib/types';

// Mock user ID for now - replace with actual WorkOS authentication
const getCurrentUserId = async (_request: NextRequest): Promise<string> => {
  // TODO: Implement WorkOS authentication
  return 'demo-user-id';
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const messages = await chatService.getMessages(chatId, limit, offset);
    return NextResponse.json({ messages });
  } catch (error: unknown) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const userId = await getCurrentUserId(request);
    const body: MessageInput = await request.json();

    // Verify user owns this chat
    const chat = await chatService.getChat(chatId, userId);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const message = await chatService.addMessage(chatId, body);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to add message' },
      { status: 500 }
    );
  }
}
