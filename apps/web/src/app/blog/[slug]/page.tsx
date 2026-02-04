import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowLeft, Clock, Eye } from 'lucide-react';
import { getServices, getRepositories } from '@/lib/context';
import { ContentRenderer } from '@/components/pages/blog/ContentRenderer';
import { ShareButtons } from '@/components/pages/blog/ShareButtons';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const services = getServices();
  const post = await services.blog.getPublishedBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | GymText Blog',
    };
  }

  return {
    title: post.metaTitle || `${post.title} | GymText Blog`,
    description: post.metaDescription || post.description || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description || undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.displayName],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const services = getServices();
  const repos = getRepositories();

  const post = await services.blog.getPublishedBySlug(slug);

  if (!post) {
    notFound();
  }

  // Track view (fire and forget)
  services.blog.trackView(post.id).catch(() => {});

  // Get cover image URL if there's a cover image
  let coverImageUrl: string | null = null;
  if (post.coverImageId) {
    const image = await repos.uploadedImage.getById(post.coverImageId);
    coverImageUrl = image?.url || null;
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/Wordmark.png"
                alt="GymText"
                width={120}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
            <Link
              href="/start"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Start Training
            </Link>
          </div>
        </div>
      </header>

      {/* Back Link */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {/* Cover Image */}
            {coverImageUrl && (
              <div className="mb-6 -mx-4 md:mx-0">
                <img
                  src={coverImageUrl}
                  alt={post.title}
                  className="w-full rounded-none md:rounded-xl shadow-lg"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Description */}
            {post.description && (
              <p className="text-xl text-gray-600 italic mb-6">{post.description}</p>
            )}

            {/* Share Buttons */}
            <div className="mb-6">
              <ShareButtons
                url={`https://gymtext.com/blog/${slug}`}
                title={post.title}
              />
            </div>

            {/* Author and Meta */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              {/* Author */}
              <div className="flex items-center gap-3">
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {post.author.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{post.author.displayName}</p>
                  {formattedDate && (
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {post.readingTimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTimeMinutes} min read
                  </span>
                )}
                {post.viewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount.toLocaleString()} views
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <ContentRenderer content={post.content} />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author.bio && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-4">
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                    {post.author.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Written by</p>
                  <p className="font-bold text-gray-900 text-lg">{post.author.displayName}</p>
                  <p className="text-gray-600 mt-2">{post.author.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GymText. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
