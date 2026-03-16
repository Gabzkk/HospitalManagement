import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export const Card = ({ children, className, hover, ...props }) => (
  <div 
    className={twMerge(
      "bg-white rounded-xl border border-gray-200 shadow-card p-4 sm:p-6",
      hover && "hover:shadow-card-hover transition-shadow duration-200 cursor-pointer",
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={twMerge("mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4", className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={twMerge("text-lg font-semibold leading-6 text-gray-900", className)}>
    {children}
  </h3>
);

export const CardFooter = ({ children, className }) => (
  <div className={twMerge("mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-3", className)}>
    {children}
  </div>
);
