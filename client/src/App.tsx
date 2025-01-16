import { useState } from 'react';
import { Message } from './types/conversation';
import ConversationHub from './components/ConversationHub';
import ChatHistory from './components/ChatHistory';

function App() {
  type ViewMode = 'chat' | 'list';
  
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const handleReturnToHub = () => {
    setActiveConversationId(null);
    setCurrentMessages([]);
    setCurrentInput('');
  };

  return (
    <div className="chat-section">
      <header>
        <h1 
          onClick={handleReturnToHub} 
          className="app-title"
        >
          Math Chat
        </h1>
      </header>
  
      {viewMode === 'chat' ? (
        <>
          <ConversationHub 
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            currentMessages={currentMessages}
            setCurrentMessages={setCurrentMessages}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
          />
          {!activeConversationId && (
            <ChatHistory
              viewMode="grid"
              onStartNewChat={handleReturnToHub}
              activeConversationId={activeConversationId}
              setActiveConversationId={setActiveConversationId}
              setCurrentMessages={setCurrentMessages}
              setViewMode={setViewMode}
            />
          )}
        </>
      ) : (
        <ChatHistory
          viewMode="list"
          onStartNewChat={handleReturnToHub}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          setCurrentMessages={setCurrentMessages}
          setViewMode={setViewMode}
        />
      )}
    </div>
  );
}

export default App;