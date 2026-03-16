import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className, variant = 'text', ...props }) => {
  const variants = {
    text: 'h-4 w-full rounded',
    title: 'h-6 w-3/4 rounded',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-24 w-full rounded-lg',
    card: 'h-32 w-full rounded-xl',
  };

  return (
    <div
      className={twMerge('animate-pulse bg-gray-200', variants[variant], className)}
      {...props}
    />
  );
};

export const SkeletonGroup = ({ count = 3, variant = 'text', gap = 'gap-3', className }) => (
  <div className={twMerge('flex flex-col', gap, className)}>
    {[...Array(count)].map((_, i) => (
      <Skeleton key={i} variant={variant} />
    ))}
  </div>
);
