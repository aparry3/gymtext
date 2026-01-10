'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DemoFilters, DemoCategory, DemoTag } from './types';
import {
  CATEGORY_CONFIG,
  TAG_CONFIG,
  getActiveCategories,
  getActiveTags,
} from './demosConfig';

interface DemosFiltersProps {
  onFiltersChange: (filters: DemoFilters) => void;
}

export function DemosFilters({ onFiltersChange }: DemosFiltersProps) {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<DemoFilters>({});

  const activeCategories = getActiveCategories();
  const activeTags = getActiveTags();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleCategoryToggle = useCallback((category: DemoCategory) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }));
  }, []);

  const handleTagToggle = useCallback((tag: DemoTag) => {
    setFilters((prev) => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      return { ...prev, tags: newTags.length > 0 ? newTags : undefined };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    setFilters({});
  }, []);

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.tags?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search demos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FilterIcon className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  {activeCategories.map((category) => (
                    <Button
                      key={category}
                      variant={filters.category === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {CATEGORY_CONFIG[category].label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {activeTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {TAG_CONFIG[tag].label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.search && (
            <FilterBadge
              label={`"${filters.search}"`}
              onRemove={() => {
                setSearchValue('');
                setFilters((prev) => ({ ...prev, search: undefined }));
              }}
            />
          )}
          {filters.category && (
            <FilterBadge
              label={CATEGORY_CONFIG[filters.category].label}
              onRemove={() => setFilters((prev) => ({ ...prev, category: undefined }))}
            />
          )}
          {filters.tags?.map((tag) => (
            <FilterBadge
              key={tag}
              label={TAG_CONFIG[tag].label}
              onRemove={() => handleTagToggle(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 h-3 w-3 rounded-full hover:bg-gray-300"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </Badge>
  );
}

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
