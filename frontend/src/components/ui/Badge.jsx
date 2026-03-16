import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'gray', size = 'md', dot, className }) => {
  const variants = {
    gray: "bg-gray-100 text-gray-800",
    green: "bg-accent-50 text-accent-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700",
    blue: "bg-primary-50 text-primary-700",
    indigo: "bg-indigo-50 text-indigo-700",
    purple: "bg-purple-50 text-purple-700",
  };

  const dotColors = {
    gray: "bg-gray-500",
    green: "bg-accent-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-primary-500",
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span className={twMerge(clsx(
      "inline-flex items-center gap-1.5 rounded-full font-medium capitalize",
      variants[variant],
      sizes[size],
      className
    ))}>
      {dot && (
        <span className={clsx("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
};
