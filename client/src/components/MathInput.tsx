import { useState } from 'react';

interface MathInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  onChange?: (value: string) => void;  // New callback for live updates
  isLoading?: boolean;
}

const MathInput = ({ onSubmit, onChange, isLoading = false }: MathInputProps) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    await onSubmit(prompt);
    setPrompt(''); // Clear input after submission
    onChange?.(''); // Also clear the preview
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    onChange?.(newValue);  // Update parent component for preview
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (prompt.trim()) {
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2">
        <textarea
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a math question..."
          disabled={isLoading}
          className="w-full p-3 border rounded-md resize-none min-h-[100px]"
          rows={4}
        />
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`px-4 py-2 rounded-md text-white transition-colors
              ${isLoading || !prompt.trim() 
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MathInput;