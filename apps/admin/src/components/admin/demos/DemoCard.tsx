'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Demo } from './types';
import { getDemoUrl, CATEGORY_CONFIG, TAG_CONFIG } from './demosConfig';

interface DemoCardProps {
  demo: Demo;
}

export function DemoCard({ demo }: DemoCardProps) {
  const [copied, setCopied] = useState(false);
  const demoUrl = getDemoUrl(demo.slug);
  const categoryConfig = CATEGORY_CONFIG[demo.category];

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDemo = () => {
    window.open(demoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 overflow-hidden">
      {demo.brandColor && (
        <div className="h-1 w-full" style={{ backgroundColor: demo.brandColor }} />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{demo.title}</CardTitle>
            {demo.subtitle && (
              <p className="text-sm text-gray-500">{demo.subtitle}</p>
            )}
          </div>
          <Badge className={cn('shrink-0', categoryConfig.color)}>
            {categoryConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <CardDescription className="text-gray-600 line-clamp-2">
          {demo.description}
        </CardDescription>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {demo.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {TAG_CONFIG[tag].label}
            </Badge>
          ))}
          {demo.tags.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{demo.tags.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <code className="text-xs text-gray-400 truncate max-w-[180px]">
          /{demo.slug}
        </code>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            className="h-8 px-2 text-gray-500 hover:text-gray-700"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-green-600" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="default" size="sm" onClick={handleOpenDemo} className="h-8 gap-1.5">
            View Demo
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

const CopyIcon = ({ className }: { className?: string }) => (
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
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
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
      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
    />
  </svg>
);
