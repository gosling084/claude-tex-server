import { useState, useEffect } from 'react';
import { Conversation, Message } from '../types/conversation';
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

  const handleSubmit = async (prompt: string) => {
    try {
      if (activeConversationId) {
        // Add to existing conversation
        const newMessage = await addMessage(activeConversationId, prompt, 'user');
        setCurrentMessages([...currentMessages, newMessage]);
      } else {
        // Create new conversation and set it as active
        const newConversation = await createConversation('New Conversation', prompt);
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

  const handleConversationSelect = async (id: string) => {
    try {
      const conversation = await getConversation(id);
      setActiveConversationId(id);
      setCurrentMessages(conversation.messages);
      setCurrentInput('');  // Clear any draft
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
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
  
      {/* Conversation grid - shows only when no active conversation */}
      {!activeConversationId && (
        <div>
          <h2>Your recent chats</h2>
          <div className="conversation-grid">
            {conversationMetas.map(conv => (
              <div 
                key={conv.id} 
                className="p-4 border border-gray-700 rounded-lg bg-[#1a1a1a] 
                         cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleConversationSelect(conv.id)}
              >
                <h3 className="font-medium mb-2">{conv.title}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(conv.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHub;