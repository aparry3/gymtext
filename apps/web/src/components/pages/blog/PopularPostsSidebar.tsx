import Link from 'next/link';
import type { BlogPostListItem } from '@gymtext/shared/server';

interface PopularPostsSidebarProps {
  posts: BlogPostListItem[];
}

export function PopularPostsSidebar({ posts }: PopularPostsSidebarProps) {
  if (posts.length === 0) return null;

  return (
    <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Posts</h3>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex gap-3 group"
          >
            <span className="text-2xl font-bold text-gray-200 group-hover:text-blue-200 transition-colors">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                {post.title}
              </h4>
              {post.readingTimeMinutes && (
                <p className="text-xs text-gray-500 mt-1">
                  {post.readingTimeMinutes} min read
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
