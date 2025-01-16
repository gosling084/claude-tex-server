import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react';
import { Conversation } from '../types/conversation';
import { getConversations, getConversation } from '../services/conversation';

interface ConversationMeta {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ChatHistoryProps {
  viewMode: 'grid' | 'list';
  onStartNewChat: () => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  setCurrentMessages: (messages: Conversation['messages']) => void;
  setViewMode: (mode: 'chat' | 'list') => void;
}

const ChatHistory = ({ 
  viewMode,
  onStartNewChat, 
  activeConversationId, 
  setActiveConversationId,
  setCurrentMessages,
  setViewMode
}: ChatHistoryProps) => {
  const [conversationMetas, setConversationMetas] = useState<ConversationMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversationMetas.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        const metas: ConversationMeta[] = data.map(conv => ({
          id: conv.id,
          title: conv.title,
          updatedAt: conv.updatedAt
        })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setConversationMetas(metas);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleConversationSelect = async (id: string) => {
    try {
      const conversation = await getConversation(id);
      setActiveConversationId(id);
      setCurrentMessages(conversation.messages);
      if (viewMode === 'list') {
        setViewMode('chat');  // Return to chat view when selecting from list
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    }
  };

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  if (viewMode === 'list') {
    return (
      <div className="list-container space-y-4">
        {/* List view header */}
        <div className="list-header">
          <div className="header-left">
            <button 
              onClick={() => setViewMode('chat')}
              className="back-button"
            >
              <ChevronLeft size={20} />
            </button>
            <h2>Your chat history</h2>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setViewMode("chat")}
              className="start-chat-button"
            >
              <PlusCircle size={16} /> Start New Chat
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-container">
          <input 
            type="text"
            placeholder="Search your chats..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Conversation list - filtered by search query */}
        <div className="conversation-list">
          {searchQuery === ""
            ? (<div>You have {conversationMetas.length} previous chats with Claude</div>)
            : (
              <div>{filteredConversations.length === 1
                ? `There is one chat matching "${searchQuery}"`
                : `There are ${filteredConversations.length} chats matching "${searchQuery}"`
              }</div>
            )
          }
          {filteredConversations.map(conv => (
            <div 
              key={conv.id}
              className="conversation-list-item"
              onClick={() => handleConversationSelect(conv.id)}
            >
              <h3>{conv.title}</h3>
              <p>Last message {new Date(conv.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="space-y-4">
      {/* Grid header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center gap-4">
          Your recent chats
          <span className="flex items-center gap-4">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="expand-button"
            >
              <span className="flex items-center gap-1">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isExpanded ? 'Hide' : 'Show'}
              </span>
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className="view-all-button"
            >
              View all →
            </button>
          </span>
        </h2>
      </div>

      {/* Grid of recent conversations */}
      {isExpanded && (
        <div className="conversation-grid">
          {conversationMetas.slice(0, 6).map(conv => (
            <div 
              key={conv.id} 
              className="conversation-item"
              onClick={() => handleConversationSelect(conv.id)}
            >
              <h3>{conv.title}</h3>
              <p>{new Date(conv.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;