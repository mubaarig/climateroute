'use client';

import { useId, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { usePlaceSuggestions } from '@/hooks/usePlaceSuggestions';
import type { PlaceSuggestion } from '@/services/geocodingService';

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: PlaceSuggestion) => void;
  placeholder?: string;
  icon: LucideIcon;
  rightSlot?: React.ReactNode;
}

export default function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  icon: Icon,
  rightSlot,
}: AddressAutocompleteProps) {
  const inputId = useId();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { suggestions } = usePlaceSuggestions(value, open);
  const showList = open && suggestions.length > 0;

  const select = (place: PlaceSuggestion) => {
    onChange(place.label);
    onSelect?.(place);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      if (e.key === 'ArrowDown') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(suggestions[activeIndex >= 0 ? activeIndex : 0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-xs font-medium text-gray-500">
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" aria-hidden />
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => value.trim().length >= 3 && setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        {showList && (
          <ul
            id={listId}
            role="listbox"
            // Keep focus on the input so onClick fires before blur closes the list.
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {suggestions.map((place, index) => (
              <li
                key={place.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(place)}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  index === activeIndex ? 'bg-green-50 text-green-800' : 'text-gray-700'
                }`}
              >
                {place.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
