'use client';

import { useState, useCallback, useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  DemoCard,
  DemosFilters,
  DEMOS,
  DemoFilters,
} from '@/components/admin/demos';

export default function DemosPage() {
  const [filters, setFilters] = useState<DemoFilters>({});

  const handleFiltersChange = useCallback((newFilters: DemoFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredDemos = useMemo(() => {
    return DEMOS.filter((demo) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          demo.title.toLowerCase().includes(searchLower) ||
          demo.description.toLowerCase().includes(searchLower) ||
          demo.slug.toLowerCase().includes(searchLower) ||
          demo.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (filters.category && demo.category !== filters.category) {
        return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => demo.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      if (demo.status !== 'active') return false;

      return true;
    });
  }, [filters]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <AdminHeader
          title="Demos"
          subtitle={`${filteredDemos.length} demo${filteredDemos.length !== 1 ? 's' : ''} available`}
        />

        <DemosFilters onFiltersChange={handleFiltersChange} />

        {filteredDemos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDemos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No demos match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
