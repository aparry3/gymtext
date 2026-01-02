'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from './ImageUploader';
import { ImageLibrary } from './ImageLibrary';
import { ImageIcon, Trash2, X } from 'lucide-react';

interface DayConfigData {
  id: string;
  date: string;
  config: {
    imageUrl?: string;
    imageName?: string;
  };
}

interface DayConfigModalProps {
  date: Date;
  config?: DayConfigData;
  onClose: () => void;
}

export function DayConfigModal({ date, config, onClose }: DayConfigModalProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState(
    config?.config?.imageUrl ?? ''
  );
  const [selectedImageName, setSelectedImageName] = useState(
    config?.config?.imageName ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExistingImage = !!config?.config?.imageUrl;
  const hasChanges =
    selectedImageUrl !== (config?.config?.imageUrl ?? '') ||
    selectedImageName !== (config?.config?.imageName ?? '');

  const handleSave = async () => {
    if (!selectedImageUrl) {
      setError('Please select an image');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/calendar/${format(date, 'yyyy-MM-dd')}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: selectedImageUrl,
            imageName: selectedImageName,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        onClose();
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch {
      setError('Failed to save config');
    }

    setIsSaving(false);
  };

  const handleClear = async () => {
    setIsClearing(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/calendar/${format(date, 'yyyy-MM-dd')}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();
      if (data.success) {
        onClose();
      } else {
        setError(data.message || 'Failed to clear');
      }
    } catch {
      setError('Failed to clear config');
    }

    setIsClearing(false);
  };

  const handleImageSelect = (url: string, name?: string) => {
    setSelectedImageUrl(url);
    setSelectedImageName(name ?? '');
    setError(null);
  };

  const handleClearSelection = () => {
    setSelectedImageUrl('');
    setSelectedImageName('');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Configure {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Current selection preview */}
          {selectedImageUrl && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedImageUrl}
                    alt={selectedImageName || 'Selected image'}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Selected Image
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedImageName || 'Untitled'}
                    </p>
                    {hasExistingImage && selectedImageUrl === config?.config?.imageUrl && (
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                        Currently set
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Tabs for library/upload */}
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="library">Image Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="mt-4">
              <ImageLibrary
                selectedUrl={selectedImageUrl}
                onSelect={handleImageSelect}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <ImageUploader onUploadComplete={handleImageSelect} />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          {hasExistingImage && (
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isSaving || isClearing}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Remove Image'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving || isClearing}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isClearing || !selectedImageUrl || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
