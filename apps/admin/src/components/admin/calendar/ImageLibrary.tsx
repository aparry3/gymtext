'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  displayName: string | null;
  category: string | null;
  createdAt: string;
}

interface ImageLibraryProps {
  selectedUrl?: string;
  onSelect: (url: string, name?: string) => void;
}

export function ImageLibrary({ selectedUrl, onSelect }: ImageLibraryProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/images');
      const data = await res.json();

      if (data.success) {
        setImages(data.data.images);
      } else {
        setError(data.message || 'Failed to load images');
      }
    } catch {
      setError('Failed to load images');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/images/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        // If deleted image was selected, clear selection
        const deletedImage = images.find((img) => img.id === id);
        if (deletedImage && deletedImage.url === selectedUrl) {
          onSelect('', '');
        }
      } else {
        alert(data.message || 'Failed to delete image');
      }
    } catch {
      alert('Failed to delete image');
    }

    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchImages}>
          Try again
        </Button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No images uploaded yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Upload an image using the &quot;Upload New&quot; tab
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {images.length} image{images.length !== 1 ? 's' : ''} in library
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
        {images.map((image) => {
          const isSelected = selectedUrl === image.url;
          const isDeleting = deletingId === image.id;

          return (
            <button
              key={image.id}
              className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-gray-300'
              } ${isDeleting ? 'opacity-50' : ''}`}
              onClick={() =>
                onSelect(image.url, image.displayName ?? image.filename)
              }
              disabled={isDeleting}
            >
              <img
                src={image.url}
                alt={image.displayName ?? image.filename}
                className="w-full h-full object-cover"
              />

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}

              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                <p className="text-white text-xs truncate">
                  {image.displayName ?? image.filename}
                </p>
              </div>

              {/* Delete button (visible on hover) */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => handleDelete(image.id, e)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
