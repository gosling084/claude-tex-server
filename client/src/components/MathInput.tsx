import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="message-form">
      
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask a math question..."
        disabled={isLoading}
        className="input-textarea"
        rows={2}
      />
  
  <div className="input-actions">
    <div className="input-actions-left">
      <button
        type="button"
        onClick={handleClear}
        disabled={isLoading || !prompt.trim()}
        className="clear-button"
      >
        Clear
      </button>
      <div className="helper-text">
        {prompt.length} characters
      </div>
    </div>

    <div className="input-actions-right">
      {prompt.trim() && (
        <div className="keyboard-hint">
          Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to send
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="send-button"
      >
        <ArrowUp/>
      </button>
    </div>
  </div>
    </form>
  );
};

export default MathInput;