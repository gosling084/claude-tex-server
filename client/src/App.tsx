import { useState } from 'react';
import MathInput from './components/MathInput';
import MathDisplay from './components/MathDisplay';
import './App.css';

function App() {
  const [currentInput, setCurrentInput] = useState('');

  const handleSubmit = async (prompt: string) => {
    console.log('Submitted prompt:', prompt);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Math Chat</h1>
        </header>

        {/* Main content */}
        <div className="flex gap-6 justify-center">
          {/* Chat section - left side */}
          <div className="w-2/3 flex flex-col">
            {/* Chat history */}
            <div className="bg-[#1a1a1a] rounded-lg mb-4 p-4 min-h-[600px]">
              <div className="flex justify-center items-center h-full text-gray-400">
                Conversation history will appear here
              </div>
            </div>

            {/* Input area */}
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="max-w-3xl mx-auto">
                <MathInput 
                  onSubmit={handleSubmit}
                  onChange={setCurrentInput}
                />
              </div>
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
      </main>
    </div>
  );
}

export default App;