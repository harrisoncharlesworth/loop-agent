import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';
import { UpdateChatRequest } from '@/lib/types';

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
    const userId = await getCurrentUserId(request);

    const chat = await chatService.getChat(chatId, userId);
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });
  } catch (error: unknown) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const userId = await getCurrentUserId(request);
    const body: UpdateChatRequest = await request.json();

    const chat = await chatService.updateChat(chatId, userId, body);
    return NextResponse.json({ chat });
  } catch (error: unknown) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update chat' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const userId = await getCurrentUserId(request);

    await chatService.deleteChat(chatId, userId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
