import ChatInterface from '@/components/ChatInterface';

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  
  return <ChatInterface chatId={chatId} />;
}
