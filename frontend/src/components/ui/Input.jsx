import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={twMerge(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Select = forwardRef(({ label, error, className, children, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={twMerge(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
            {children}
        </select>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  });
  
Select.displayName = 'Select';

export const Textarea = forwardRef(({ label, error, className, id, ...props }, ref) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
        {label && (
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            </label>
        )}
        <textarea
            id={id}
            ref={ref}
            className={twMerge(
            "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            className
            )}
            {...props}
        />
        {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
        </div>
    );
});

Textarea.displayName = 'Textarea';
