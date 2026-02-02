'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-react';
import { TipTapEditor } from '@/components/blog/TipTapEditor';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);
  };

  const handleGenerateMetadata = async () => {
    // Check content length (strip HTML for accurate count)
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (textContent.length < 100) {
      setError('Write at least 100 characters of content before generating metadata');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/blog/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to generate metadata');
      }

      // Populate all fields from generated metadata
      const { title: genTitle, description: genDescription, tags: genTags, metaTitle: genMetaTitle, metaDescription: genMetaDescription } = result.data;

      setTitle(genTitle);
      setSlug(generateSlug(genTitle));
      setDescription(genDescription);
      setTags(genTags.join(', '));
      setMetaTitle(genMetaTitle);
      setMetaDescription(genMetaDescription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create post');
      }

      router.push(`/blog/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">New Blog Post</h1>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </div>

          {error && (
            <Card className="border-destructive/20 bg-destructive/5 p-4">
              <p className="text-destructive text-sm">{error}</p>
            </Card>
          )}

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">/blog/</span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-url-slug"
                    maxLength={200}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to auto-generate from title
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for listings and SEO"
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <TipTapEditor content={content} onChange={setContent} />
              </div>

              {/* Generate Metadata Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateMetadata}
                  disabled={isGenerating || isSubmitting}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Metadata
                    </>
                  )}
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="fitness, training, nutrition (comma-separated)"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Title
                  <span className="text-muted-foreground font-normal ml-2">
                    ({metaTitle.length}/70)
                  </span>
                </label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Custom title for search engines"
                  maxLength={70}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Description
                  <span className="text-muted-foreground font-normal ml-2">
                    ({metaDescription.length}/160)
                  </span>
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Custom description for search engines"
                  maxLength={160}
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[60px] resize-y"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
