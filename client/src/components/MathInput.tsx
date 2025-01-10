import { useState, useRef, useEffect } from 'react';

interface MathInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  onChange?: (value: string) => void;
  isLoading?: boolean;
}

const MathInput = ({ onSubmit, onChange, isLoading = false }: MathInputProps) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to allow shrinking
      textarea.style.height = 'auto';
      // Set new height based on scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust height on content change
  useEffect(() => {
    adjustHeight();
  }, [prompt]);

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

  const handleClear = () => {
    setPrompt('');
    onChange?.('');
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
          ref={textareaRef}
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a math question..."
          disabled={isLoading}
          className="w-full p-3 border border-gray-700 rounded-md resize-none
                     bg-[#1a1a1a] text-white placeholder-gray-500
                     overflow-hidden"
          rows={2}  // Start with one row, will grow automatically
        />
        
        <div className="text-center text-sm space-y-1">
          <div className="text-gray-400">
            {prompt.length} characters
          </div>
          <div className="text-gray-400">
            Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to send
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || !prompt.trim()}
            className={`px-4 py-2 rounded-md text-white transition-colors
              ${isLoading || !prompt.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600'
              }`}
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`px-4 py-2 rounded-md text-white transition-colors
              ${isLoading || !prompt.trim() 
                ? 'bg-blue-900 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
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