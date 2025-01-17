import { useState } from 'react';
import { sendMessage } from '../services/claude';
import Message from '@anthropic-ai/sdk';
import { ClaudeError } from '../types/api';

const TestAPI = () => {
  const [response, setResponse] = useState<Message | ClaudeError | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await sendMessage("What is 2+2? Please respond only with the number.");
      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <button 
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Claude API
      </button>
      
      {loading && <p>Loading...</p>}
      
      {response && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestAPI;