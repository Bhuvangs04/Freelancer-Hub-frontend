import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { X, AlertCircle } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

export const TagInput = ({ tags, onChange, error }: TagInputProps) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = input.trim();
      
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className={`tag-input ${error ? 'border-red-500' : ''}`}>
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button onClick={() => removeTag(index)} className="text-primary hover:text-primary/80">
              <X className="h-4 w-4" />
            </button>
          </span>
        ))}
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-0 outline-none focus-visible:ring-0 flex-grow min-w-[120px]"
          placeholder={tags.length === 0 ? "Type and press Enter to add tags" : ""}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};