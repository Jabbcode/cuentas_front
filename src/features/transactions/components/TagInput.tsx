import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Tag } from 'lucide-react';
import { TagBadge } from './TagBadge';
import type { Tag as TagType } from '../../../types';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: TagType[];
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Agregar tag...',
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions
    .map((t) => t.name)
    .filter((name) => !value.includes(name) && name.includes(input.toLowerCase()));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addTag = (name: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized || value.includes(normalized)) return;
    onChange([...value, normalized]);
    setInput('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (name: string) => {
    onChange(value.filter((t) => t !== name));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <Tag className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        {value.map((tag) => (
          <TagBadge key={tag} name={tag} onRemove={() => removeTag(tag)} />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-24 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {open &&
        (filtered.length > 0 || (input.trim() && !value.includes(input.trim().toLowerCase()))) && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(name);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Tag className="h-3.5 w-3.5 text-indigo-500" />
                {name}
              </button>
            ))}
            {input.trim() &&
              !value.includes(input.trim().toLowerCase()) &&
              !filtered.includes(input.trim().toLowerCase()) && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(input);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                >
                  <Tag className="h-3.5 w-3.5" />
                  Crear "{input.trim().toLowerCase()}"
                </button>
              )}
          </div>
        )}
      <p className="mt-1 text-xs text-gray-400">Presiona Enter o coma para agregar</p>
    </div>
  );
}
