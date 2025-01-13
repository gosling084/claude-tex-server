import { useState, useEffect } from 'react';
import { Conversation } from '../types/conversation';
import { getConversations, createConversation, addMessage } from '../services/conversation';
import ChatMessage from './ChatMessage';

const ConversationTest = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Test creating a new conversation
  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation(
        'Test Conversation',
        'This is a test message'
      );
      setConversations([...conversations, newConversation]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
    }
  };

  // Test adding a message
  const handleAddMessage = async (conversationId: string) => {
    try {
      const message = await addMessage(
        conversationId,
        'This is a test response',
        'assistant'
      );
      
      // Update conversations with new message
      setConversations(conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, message]
          };
        }
        return conv;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message');
    }
  };

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <button 
          onClick={handleCreateConversation}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Test Conversation
        </button>
      </div>

      {conversations.map(conversation => (
        <div key={conversation.id} className="border rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">{conversation.title}</h3>
          <div className="space-y-4">
            {conversation.messages.map(message => (
              <ChatMessage
                key={message.id}
                id={message.id}
                type={message.type}
                content={message.content}
                timestamp={new Date(message.timestamp)}
              />
            ))}
          </div>
          <button
            onClick={() => handleAddMessage(conversation.id)}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Add Test Message
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConversationTest;