'use client';

import { useState } from 'react';
import { ToolsTab } from './ToolsTab';
import { ContextTab } from './ContextTab';

type TabId = 'tools' | 'context';

const tabs: { id: TabId; label: string }[] = [
  { id: 'tools', label: 'Tools' },
  { id: 'context', label: 'Context' },
];

export function RegistryEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('tools');

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] mt-6">
      {/* Tab Bar */}
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'tools' && <ToolsTab />}
        {activeTab === 'context' && <ContextTab />}
      </div>
    </div>
  );
}
