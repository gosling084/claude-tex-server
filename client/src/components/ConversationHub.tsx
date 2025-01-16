import { useState, useEffect } from 'react';
import { Message } from '../types/conversation';
import { getConversations, getConversation, createConversation, addMessage } from '../services/conversation';
import MathInput from './MathInput';
import ChatMessage from './ChatMessage';

interface ConversationMeta {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ConversationHubProps {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  currentMessages: Message[];
  setCurrentMessages: (messages: Message[]) => void;
  currentInput: string;
  setCurrentInput: (input: string) => void;
}

const ConversationHub = ({ 
  activeConversationId,
  setActiveConversationId,
  currentMessages,
  setCurrentMessages,
  currentInput,
  setCurrentInput
}: ConversationHubProps) => {
  const [conversationMetas, setConversationMetas] = useState<ConversationMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversation metadata on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        const metas: ConversationMeta[] = data.map(conv => ({
          id: conv.id,
          title: conv.title,
          updatedAt: conv.updatedAt
        }));
        setConversationMetas(metas);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const inferTitle = (message: string): string => {
    // Take first 5 words or up to first question mark
    const title = message.split('?')[0].split(' ').slice(0, 5).join(' ');
    return title + (title.length < message.length ? '...' : '');
  };

  const handleSubmit = async (prompt: string) => {
    try {
      if (activeConversationId) {
        // Add to existing conversation
        const newMessage = await addMessage(activeConversationId, prompt, 'user');
        setCurrentMessages([...currentMessages, newMessage]);
      } else {
        // Create new conversation and set it as active
        const newConversation = await createConversation(inferTitle(prompt), prompt);
        setActiveConversationId(newConversation.id);
        setCurrentMessages(newConversation.messages);
        // Add to conversation metas
        setConversationMetas([{
          id: newConversation.id,
          title: newConversation.title,
          updatedAt: newConversation.updatedAt
        }, ...conversationMetas]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process message');
    }
  };

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Chat history - shows only when conversation is active */}
      {activeConversationId && (
        <div className="chat-history">
          {currentMessages.map(message => (
            <ChatMessage
              key={message.id}
              id={message.id}
              type={message.type}
              content={message.content}
              timestamp={new Date(message.timestamp)}
            />
          ))}
        </div>
      )}
  
      {/* Preview and input - always visible */}
      <div className="chat-history">
        <ChatMessage
          id="draft"
          type="draft"
          content={currentInput.trim() ? currentInput : "Message preview will appear here"}
        />
      </div>
  
      <div className="input-container">
        <MathInput 
          onSubmit={handleSubmit}
          onChange={setCurrentInput}
        />
      </div>

    </div>
  );
};

export default ConversationHub;