import { useState } from 'react';
import MathInput from './components/MathInput';
import ChatMessage from './components/ChatMessage';
import ChatMessageTest from './components/ChatMessageTest';

function App() {
  const [currentInput, setCurrentInput] = useState('');

  const handleSubmit = async (prompt: string) => {
    console.log('Submitted prompt:', prompt);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
            {currentInput.trim() && (
              <ChatMessage
                id="draft"
                type="draft"
                content={currentInput}
              />
            )}
          </div>

          {/* Input area */}
          <div className="input-container">
            <MathInput 
              onSubmit={handleSubmit}
              onChange={setCurrentInput}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;