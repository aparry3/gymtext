'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Loader2, Trash2, Globe, EyeOff, Eye, ImagePlus, X } from 'lucide-react';
import { TipTapEditor } from '@/components/blog/TipTapEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  coverImageId: string | null;
  coverImageUrl: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to load post');
        }

        const data = result.data;
        setPost(data);
        setTitle(data.title);
        setSlug(data.slug);
        setDescription(data.description || '');
        setContent(data.content);
        setTags(data.tags.join(', '));
        setMetaTitle(data.metaTitle || '');
        setMetaDescription(data.metaDescription || '');
        setCoverImageId(data.coverImageId || null);
        setCoverImageUrl(data.coverImageUrl || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
          coverImageId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save post');
      }

      setPost(result.data);
      setCoverImageUrl(result.data.coverImageUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/blog/images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload image');
      }

      setCoverImageId(result.data.id);
      setCoverImageUrl(result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImageId(null);
    setCoverImageUrl(null);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${id}/publish`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to publish post');
      }

      setPost(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${id}/publish`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to unpublish post');
      }

      setPost(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete post');
      }

      router.push('/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <p className="text-destructive text-center">{error}</p>
          <div className="text-center mt-4">
            <Link href="/blog">
              <Button variant="outline">Back to Blog</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

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

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Edit Post</h1>
            {post && getStatusBadge(post.status)}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>

            {post?.status === 'draft' ? (
              <Button
                variant="outline"
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </Button>
            ) : post?.status === 'published' ? (
              <Button
                variant="outline"
                onClick={handleUnpublish}
                disabled={isSubmitting}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </Button>
            ) : null}

            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {/* Stats (for published posts) */}
        {post?.status === 'published' && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount} views
            </span>
            {post.publishedAt && (
              <span>
                Published {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            )}
            <a
              href={`${process.env.NEXT_PUBLIC_WEB_BASE_URL || 'https://gymtext.com'}/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View live
            </a>
          </div>
        )}

        {showPreview ? (
          /* Preview Mode */
          <Card>
            <CardContent className="pt-6">
              <article className="prose prose-lg max-w-none">
                <h1>{title}</h1>
                {description && <p className="lead">{description}</p>}
                <div dangerouslySetInnerHTML={{ __html: content.replace(/<p><\/p>/g, '<p><br></p>') }} />
              </article>
            </CardContent>
          </Card>
        ) : (
          /* Edit Mode */
          <>
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                  <label className="block text-sm font-medium mb-2">Cover Image</label>
                  {coverImageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={coverImageUrl}
                        alt="Cover"
                        className="max-w-md max-h-48 rounded-lg object-cover border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveCoverImage}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploadingImage}
                        />
                        <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Upload cover image</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1200x630px
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <TipTapEditor content={content} onChange={setContent} />
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

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete this post</p>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
