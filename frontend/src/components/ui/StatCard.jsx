import React from 'react';
import { twMerge } from 'tailwind-merge';

export const StatCard = ({ icon: Icon, label, value, trend, trendLabel, iconColor = 'bg-primary-100 text-primary-600', className }) => (
  <div className={twMerge(
    "bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover transition-shadow duration-200 p-5",
    className
  )}>
    <div className="flex items-center gap-4">
      <div className={twMerge("p-3 rounded-lg", iconColor)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <span className={twMerge(
              "text-xs font-medium",
              trend >= 0 ? 'text-accent-600' : 'text-red-600'
            )}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              {trendLabel && <span className="text-gray-400 ml-1">{trendLabel}</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);
