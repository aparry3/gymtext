'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import type { ParseResult as SharedParseResult } from '@gymtext/shared/server';

export interface ParseResult extends SharedParseResult {
  success: boolean;
  error?: string;
}

interface FileUploaderProps {
  onParseComplete: (result: ParseResult) => void;
}

const ACCEPTED_EXTENSIONS = '.pdf,.csv,.xlsx,.xls,.txt';
const ACCEPTED_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
];

function getFileIcon(fileName: string) {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return <FileText className="w-8 h-8 text-red-500" />;
    case 'csv':
    case 'xlsx':
    case 'xls':
      return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
}

function isValidFileType(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const ext = file.name.toLowerCase().split('.').pop();
  return ['pdf', 'csv', 'xlsx', 'xls', 'txt'].includes(ext || '');
}

export function FileUploader({ onParseComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setError(null);
    setParseSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      processFile(file);
    } else {
      setError('Please drop a PDF, CSV, XLSX, or TXT file');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!isValidFileType(file)) {
      setError('Unsupported file type. Please use PDF, CSV, XLSX, or TXT');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setParseSuccess(false);
    setSelectedFile(file);
  };

  const handleParse = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsParsing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/files/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setParseSuccess(true);
        onParseComplete({
          success: true,
          text: data.data.text,
          fileName: data.data.fileName,
          fileType: data.data.fileType,
          metadata: data.data.metadata,
        });
      } else {
        setError(data.message || 'Failed to parse file');
        onParseComplete({
          success: false,
          text: '',
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          metadata: {},
          error: data.message,
        });
      }
    } catch {
      setError('Failed to parse file');
      onParseComplete({
        success: false,
        text: '',
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        metadata: {},
        error: 'Failed to parse file',
      });
    }

    setIsParsing(false);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${parseSuccess ? 'border-green-500 bg-green-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              {getFileIcon(selectedFile.name)}
              <span className="font-medium text-gray-700">
                {selectedFile.name}
              </span>
              <span className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            {parseSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Parsed successfully!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-600">
                Drag and drop a file here, or
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              PDF, CSV, XLSX, TXT up to 10MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {selectedFile && !parseSuccess && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetState}
            disabled={isParsing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleParse}
            disabled={isParsing}
            className="flex-1"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Extract Text
              </>
            )}
          </Button>
        </div>
      )}

      {parseSuccess && (
        <Button variant="outline" onClick={resetState} className="w-full">
          Upload Another File
        </Button>
      )}
    </div>
  );
}
