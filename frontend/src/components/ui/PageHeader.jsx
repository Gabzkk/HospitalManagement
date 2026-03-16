import React from 'react';
import { twMerge } from 'tailwind-merge';

export const PageHeader = ({ title, children, className }) => (
  <div className={twMerge("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
    <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);
