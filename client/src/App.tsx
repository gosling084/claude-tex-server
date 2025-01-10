import { useState } from 'react';
import MathInput from './components/MathInput';
import MathDisplay from './components/MathDisplay';
import ChatMessageTest from './components/ChatMessageTest';
import './App.css';

function App() {
  const [currentInput, setCurrentInput] = useState('');

  const handleSubmit = async (prompt: string) => {
    console.log('Submitted prompt:', prompt);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Math Chat</h1>
      </header>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Chat section - left side */}
        <div className="w-2/3">
          {/* Chat history */}
          <div className="bg-[#1a1a1a] rounded-lg mb-4 p-4 min-h-[600px]">
            <ChatMessageTest />
          </div>

          {/* Input area */}
          <div className="bg-[#1a1a1a] rounded-lg p-4">
            <MathInput 
              onSubmit={handleSubmit}
              onChange={setCurrentInput}
            />
          </div>
        </div>

        {/* Preview section - right side */}
        <div className="w-1/3">
          <div className="bg-[#1a1a1a] rounded-lg p-4 sticky top-6">
            <h2 className="text-sm font-semibold mb-2 text-center">Live Preview</h2>
            {currentInput.trim() ? (
              <MathDisplay tex={currentInput} />
            ) : (
              <p className="text-gray-400 italic text-center">
                Your input preview will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;