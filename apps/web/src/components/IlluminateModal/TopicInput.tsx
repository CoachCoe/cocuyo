'use client';

/**
 * TopicInput — Tag selector for signal topics.
 *
 * Features:
 * - Selected topics displayed as removable pills
 * - Suggestions dropdown with existing topics
 * - Add on Enter or comma
 * - Remove on backspace when input is empty
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactElement,
  type KeyboardEvent,
} from 'react';

interface TopicInputProps {
  id?: string;
  topics: string[];
  onChange: (topics: string[]) => void;
  placeholder?: string;
}

// Common topics in the network (would come from API in production)
const SUGGESTED_TOPICS = [
  'environmental',
  'water-quality',
  'local-government',
  'public-services',
  'education',
  'public-health',
  'housing',
  'development',
  'public-records',
  'safety',
  'labor',
  'public-safety',
  'equity',
  'transportation',
  'documentation',
];

export function TopicInput({
  id,
  topics,
  onChange,
  placeholder = 'Add a topic',
}: TopicInputProps): ReactElement {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input and already selected topics
  const filteredSuggestions = SUGGESTED_TOPICS.filter(
    (topic) =>
      !topics.includes(topic) &&
      topic.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTopic = useCallback(
    (topic: string): void => {
      const normalized = topic.toLowerCase().trim().replace(/\s+/g, '-');
      if (normalized.length > 0 && !topics.includes(normalized)) {
        onChange([...topics, normalized]);
      }
      setInputValue('');
      setHighlightedIndex(-1);
    },
    [topics, onChange]
  );

  const removeTopic = useCallback(
    (topicToRemove: string): void => {
      onChange(topics.filter((t) => t !== topicToRemove));
    },
    [topics, onChange]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      // Check for comma to add topic
      if (value.includes(',')) {
        const parts = value.split(',');
        const topicToAdd = parts[0];
        if (topicToAdd != null) {
          addTopic(topicToAdd);
        }
      } else {
        setInputValue(value);
        setShowSuggestions(value.length > 0);
        setHighlightedIndex(-1);
      }
    },
    [addTopic]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
            const suggestion = filteredSuggestions[highlightedIndex];
            if (suggestion != null) {
              addTopic(suggestion);
            }
          } else if (inputValue.trim().length > 0) {
            addTopic(inputValue);
          }
          break;

        case 'Backspace':
          if (inputValue.length === 0 && topics.length > 0) {
            const lastTopic = topics[topics.length - 1];
            if (lastTopic != null) {
              removeTopic(lastTopic);
            }
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (showSuggestions && filteredSuggestions.length > 0) {
            setHighlightedIndex((prev) =>
              prev < filteredSuggestions.length - 1 ? prev + 1 : 0
            );
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (showSuggestions && filteredSuggestions.length > 0) {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredSuggestions.length - 1
            );
          }
          break;

        case 'Escape':
          setShowSuggestions(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [
      inputValue,
      topics,
      filteredSuggestions,
      highlightedIndex,
      showSuggestions,
      addTopic,
      removeTopic,
    ]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string): void => {
      addTopic(suggestion);
      inputRef.current?.focus();
    },
    [addTopic]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        containerRef.current != null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap gap-2 p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg focus-within:border-[var(--color-accent)] transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Selected topic pills */}
        {topics.map((topic) => (
          <span
            key={topic}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-full"
          >
            {topic}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTopic(topic);
              }}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label={`Remove ${topic}`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 0 || filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={topics.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none"
          autoComplete="off"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-controls={showSuggestions ? 'topic-suggestions' : undefined}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          id="topic-suggestions"
          role="listbox"
          className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg shadow-lg"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                px-4 py-2 text-sm cursor-pointer transition-colors
                ${
                  index === highlightedIndex
                    ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
