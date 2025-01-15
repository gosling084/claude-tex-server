import { useState } from 'react';
import { Message } from './types/conversation';
import ConversationHub from './components/ConversationHub';

function App() {
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
          className="app-title cursor-pointer"
        >
          Math Chat
        </h1>
      </header>

      <ConversationHub 
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        currentMessages={currentMessages}
        setCurrentMessages={setCurrentMessages}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
      />
    </div>
  );
}

export default App;