'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DossierSectionProps {
  title: string;
  content: string;
  onSave: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function DossierSection({
  title,
  content,
  onSave,
  isLoading = false,
}: DossierSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = async () => {
    if (editValue === content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-700 rounded" />
          <div className="h-3 w-3/4 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 transition-all',
        isHovered && !isEditing && 'border-slate-600'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              'p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            aria-label={`Edit ${title}`}
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[100px]"
            autoFocus
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-50"
            >
              <Check size={14} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Press Cmd+Enter to save, Esc to cancel
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
          {content || <span className="text-slate-500 italic">No information yet</span>}
        </p>
      )}
    </div>
  );
}
