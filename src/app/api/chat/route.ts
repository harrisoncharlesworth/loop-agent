import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { allTools } from '@/lib/tools';
import { Message, ToolCall } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await request.json();
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Convert our messages to Anthropic format
    const anthropicMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    // Prepare tools for Anthropic API
    const tools = allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema as { type: "object"; properties?: Record<string, unknown>; required?: string[] }
    }));

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: anthropicMessages,
      tools: tools
    });

    const toolCalls: ToolCall[] = [];
    let finalContent = '';

    // Handle tool use
    if (response.content.some(block => block.type === 'tool_use')) {
      // Execute tools
      const toolResults = [];
      
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const tool = allTools.find(t => t.name === block.name);
          if (tool) {
            try {
              const result = await tool.handler(block.input as Record<string, unknown>);
              toolCalls.push({
                id: block.id,
                name: block.name,
                input: block.input as Record<string, unknown>,
                output: result
              });
              
              toolResults.push({
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: result
              });
            } catch (error: unknown) {
              const errorMsg = (error as Error).message || 'Tool execution failed';
              toolCalls.push({
                id: block.id,
                name: block.name,
                input: block.input as Record<string, unknown>,
                output: '',
                error: errorMsg
              });
              
              toolResults.push({
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: errorMsg,
                is_error: true
              });
            }
          }
        } else if (block.type === 'text') {
          finalContent += block.text;
        }
      }

      // Get final response with tool results
      if (toolResults.length > 0) {
        const followUpResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            ...anthropicMessages,
            {
              role: 'assistant',
              content: response.content
            },
            {
              role: 'user',
              content: toolResults
            }
          ],
          tools: tools
        });

        // Extract text from follow-up response
        for (const block of followUpResponse.content) {
          if (block.type === 'text') {
            finalContent += block.text;
          }
        }
      }
    } else {
      // No tools used, just get the text content
      for (const block of response.content) {
        if (block.type === 'text') {
          finalContent += block.text;
        }
      }
    }

    const responseMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: finalContent,
      timestamp: new Date(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined
    };

    return NextResponse.json({ message: responseMessage });
    
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}
