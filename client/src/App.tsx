import { useState } from 'react';
import MathInput from './components/MathInput';
import ChatMessage from './components/ChatMessage';
import ChatMessageTest from './components/ChatMessageTest';
import ConversationTest from './components/ConversationTest';

function App() {
  const [currentInput, setCurrentInput] = useState('');

  const handleSubmit = async (prompt: string) => {
    console.log('Submitted prompt:', prompt);
    // Later this will handle the actual API call
    // await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header>
        <h1 className="app-title">Math Chat</h1>
      </header>

      {/* Main content */}
      <main className="main-layout">
        <div className="chat-section">
          {/* Chat history */}
          <div className="chat-history">
            <ChatMessageTest />
            {/* Show draft message if there's input */}
              <ChatMessage
                id="draft"
                type="draft"
                content={currentInput.trim() ? currentInput : "Message preview will appear here"}
              />
          </div>

          {/* Input area */}
          <div className="input-container">
            <MathInput 
              onSubmit={handleSubmit}
              onChange={setCurrentInput}
            />
          </div>
        </div>
        <div className="chat-section">
          <ConversationTest />
        </div>  
      </main>
    </div>
  );
}

export default App;