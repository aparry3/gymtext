import Link from 'next/link';
import type { BlogPostListItem } from '@gymtext/shared/server';

interface BlogPostCardProps {
  post: BlogPostListItem;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* Description */}
          {post.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {post.author.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{post.author.displayName}</span>
            </div>

            {formattedDate && (
              <>
                <span className="text-gray-300">|</span>
                <span>{formattedDate}</span>
              </>
            )}

            {post.readingTimeMinutes && (
              <>
                <span className="text-gray-300">|</span>
                <span>{post.readingTimeMinutes} min read</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
