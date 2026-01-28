'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProgramSummary {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isPublic: boolean;
  enrollmentCount: number;
  createdAt: string;
  publishedVersionId: string | null;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/programs');
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to load programs');
        }

        setPrograms(result.data.programs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load programs');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(search.toLowerCase()) ||
    program.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <p className="text-destructive text-center">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Programs</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your fitness programs
            </p>
          </div>
          <Link href="/programs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Programs List */}
        {filteredPrograms.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              {programs.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first fitness program to get started
                  </p>
                  <Link href="/programs/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Program
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">No matching programs</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms
                  </p>
                </>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPrograms.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="block"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold truncate">{program.name}</h3>
                        {program.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {program.isPublic && (
                          <Badge variant="outline">Public</Badge>
                        )}
                        {!program.publishedVersionId && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            Unpublished
                          </Badge>
                        )}
                      </div>
                      {program.description && (
                        <p className="text-muted-foreground line-clamp-2">
                          {program.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold">{program.enrollmentCount}</p>
                      <p className="text-sm text-muted-foreground">enrollments</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
