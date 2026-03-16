import React from 'react';
import clsx from 'clsx';

export const Tabs = ({ tabs, activeTab, onChange, className }) => (
  <div className={clsx("border-b border-gray-200", className)}>
    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium flex items-center gap-2 transition-colors',
              isActive
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={clsx(
                'ml-1 rounded-full px-2 py-0.5 text-xs font-medium',
                isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  </div>
);
