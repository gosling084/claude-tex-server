// components/ModelSelector.tsx
import { useState, useRef, useEffect } from 'react';
import { ModelConfig, CLAUDE_MODELS } from '../types/config';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ModelSelectorProps {
  currentModel: ModelConfig;
  onModelChange: (model: ModelConfig) => void;
}

const ModelSelector = ({ currentModel, onModelChange }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button" // Add this to prevent form submission
        onClick={() => setIsOpen(!isOpen)}
        className="model-selector-button"
      >
        {currentModel.name} {isOpen ? <ChevronUp/>: <ChevronDown/>} 
      </button>

      {isOpen && (
        <div className="model-selector-dropdown">
          {CLAUDE_MODELS.map((model) => (
            <button
              key={model.id}
              type="button" // Add this to prevent form submission
              onClick={() => {
                onModelChange(model);
                setIsOpen(false);
              }}
              className="model-option"
            >
              <div className='model-option-name'>{model.name}</div>
              <div className='model-option-description'>{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;