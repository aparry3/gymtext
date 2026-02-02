import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getServices } from '@/lib/context';
import { BlogPostCard } from '@/components/pages/blog/BlogPostCard';
import { PopularPostsSidebar } from '@/components/pages/blog/PopularPostsSidebar';
import { SearchInput } from '@/components/pages/blog/SearchInput';

export const metadata = {
  title: 'Blog | GymText',
  description: 'Fitness tips, workout advice, and training insights from the GymText team.',
};

interface BlogPageProps {
  searchParams: Promise<{
    tag?: string;
    search?: string;
    page?: string;
  }>;
}

const POSTS_PER_PAGE = 9;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const services = getServices();

  const page = Math.max(1, parseInt(params.page || '1', 10));
  const offset = (page - 1) * POSTS_PER_PAGE;

  // Fetch data in parallel
  const [postsResult, popularPosts, tags] = await Promise.all([
    services.blog.listPublished({
      limit: POSTS_PER_PAGE,
      offset,
      tag: params.tag,
      search: params.search,
    }),
    services.blog.listPopular(5),
    services.blog.listTags(),
  ]);

  const { posts, total } = postsResult;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
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

      {/* Hero Section */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GymText Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Expert fitness tips, training insights, and workout advice to help you achieve your goals.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column */}
          <div className="flex-1">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <Suspense fallback={<div className="h-12 bg-gray-100 rounded-xl animate-pulse" />}>
                <SearchInput />
              </Suspense>

              {/* Active Filters */}
              {(params.tag || params.search) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Filtering by:</span>
                  {params.tag && (
                    <Link
                      href={`/blog${params.search ? `?search=${params.search}` : ''}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      Tag: {params.tag}
                      <span className="text-blue-500">&times;</span>
                    </Link>
                  )}
                  {params.search && (
                    <Link
                      href={`/blog${params.tag ? `?tag=${params.tag}` : ''}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      Search: &quot;{params.search}&quot;
                      <span className="text-blue-500">&times;</span>
                    </Link>
                  )}
                  <Link
                    href="/blog"
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </Link>
                </div>
              )}
            </div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h2>
                <p className="text-gray-600">
                  {params.tag || params.search
                    ? 'Try adjusting your filters or search terms.'
                    : 'Check back soon for new content!'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="flex justify-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={buildPageUrl(params, page - 1)}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </Link>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, index, arr) => {
                        // Add ellipsis
                        const prev = arr[index - 1];
                        const showEllipsis = prev && p - prev > 1;

                        return (
                          <span key={p} className="flex items-center gap-2">
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Link
                              href={buildPageUrl(params, p)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                p === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {p}
                            </Link>
                          </span>
                        );
                      })}

                    {page < totalPages && (
                      <Link
                        href={buildPageUrl(params, page + 1)}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            {/* Popular Posts */}
            <PopularPostsSidebar posts={popularPosts} />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                        params.tag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag} ({count})
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GymText. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function buildPageUrl(
  params: { tag?: string; search?: string },
  page: number
): string {
  const urlParams = new URLSearchParams();
  if (params.tag) urlParams.set('tag', params.tag);
  if (params.search) urlParams.set('search', params.search);
  if (page > 1) urlParams.set('page', String(page));

  const queryString = urlParams.toString();
  return `/blog${queryString ? `?${queryString}` : ''}`;
}
