import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { firstMessage }: { firstMessage: string } = await request.json();
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    if (!firstMessage || firstMessage.trim().length === 0) {
      return NextResponse.json({ title: 'New Chat' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Generate a short, descriptive title (max 5 words) for a chat conversation that starts with this message: "${firstMessage.trim()}"`
      }]
    });

    let title = 'New Chat';
    
    for (const block of response.content) {
      if (block.type === 'text') {
        title = block.text.trim();
        break;
      }
    }

    // Clean up the title - remove quotes and ensure it's reasonable length
    title = title.replace(/^["']|["']$/g, '').substring(0, 50);
    
    if (!title || title.length === 0) {
      title = 'New Chat';
    }

    return NextResponse.json({ title });
    
  } catch (error: unknown) {
    console.error('Title generation error:', error);
    return NextResponse.json({ title: 'New Chat' });
  }
}
