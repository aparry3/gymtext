'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete: (url: string, name: string) => void;
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPreview(null);
    setDisplayName('');
    setError(null);
    setUploadSuccess(false);
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
    if (file && file.type.startsWith('image/')) {
      await processFile(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setUploadSuccess(false);
    setPreview(URL.createObjectURL(file));
    setDisplayName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0] && !preview) {
      setError('Please select a file');
      return;
    }

    // Get file from input or drag
    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];

    if (!file) {
      setError('No file selected');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('displayName', displayName || file.name);
    formData.append('category', 'holiday');

    try {
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess(true);
        onUploadComplete(data.data.url, data.data.displayName);
        // Reset after a short delay so user can see success state
        setTimeout(resetState, 1500);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    }

    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploadSuccess ? 'border-green-500 bg-green-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg border shadow-sm"
            />
            {uploadSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Uploaded successfully!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-600">Drag and drop an image here, or</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </div>
            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Display name input and upload button */}
      {preview && !uploadSuccess && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., 4th of July, Christmas"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetState}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
