import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';
import { CreateChatRequest } from '@/lib/types';

// Mock user ID for now - replace with actual WorkOS authentication
const getCurrentUserId = async (_request: NextRequest): Promise<string> => {
  // TODO: Implement WorkOS authentication
  // const session = await getSession(request);
  // return session.user.id;
  return 'demo-user-id';
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const chats = await chatService.getChats(userId, limit, offset);
    return NextResponse.json({ chats });
  } catch (error: unknown) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    const body: CreateChatRequest = await request.json();

    const chat = await chatService.createChat(userId, body);
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create chat' },
      { status: 500 }
    );
  }
}
