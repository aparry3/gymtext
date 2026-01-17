'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, X, FileText, Table, FileSpreadsheet } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ParseResult } from './FileUploader';

interface TextPreviewProps {
  result: ParseResult;
  onClear: () => void;
}

function formatFileType(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return 'PDF';
    case 'text/csv':
      return 'CSV';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'XLSX';
    case 'application/vnd.ms-excel':
      return 'XLS';
    case 'text/plain':
      return 'TXT';
    default:
      return fileType;
  }
}

function getFileTypeIcon(fileType: string) {
  switch (fileType) {
    case 'application/pdf':
      return <FileText className="w-4 h-4" />;
    case 'text/csv':
      return <Table className="w-4 h-4" />;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return <FileSpreadsheet className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

export function TextPreview({ result, onClear }: TextPreviewProps) {
  const [copied, setCopied] = useState(false);

  // Use formattedProgram if available, otherwise fall back to raw text
  const displayText = result.formattedProgram || result.text;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = displayText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = displayText.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getFileTypeIcon(result.fileType)}
            <span className="font-medium">{result.fileName}</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
              {formatFileType(result.fileType)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span>{charCount.toLocaleString()} characters</span>
        <span>{wordCount.toLocaleString()} words</span>
        {result.metadata.pageCount && (
          <span>{result.metadata.pageCount} pages</span>
        )}
        {result.metadata.rowCount && (
          <span>{result.metadata.rowCount} rows</span>
        )}
        {result.metadata.sheetNames && result.metadata.sheetNames.length > 1 && (
          <span>{result.metadata.sheetNames.length} sheets</span>
        )}
      </div>

      <div className="relative">
        {result.formattedProgram ? (
          <div className="p-4 bg-gray-50 border rounded-lg overflow-auto max-h-[500px] prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.formattedProgram}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="p-4 bg-gray-50 border rounded-lg overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap break-words">
            {result.text}
          </pre>
        )}
      </div>
    </div>
  );
}
