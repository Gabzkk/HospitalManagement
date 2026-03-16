import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const SearchInput = ({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const timerRef = useRef(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange?.(val), debounceMs);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
  };

  return (
    <div className={twMerge("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        {...props}
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
