'use client';

interface ContentRendererProps {
  content: string;
}

/**
 * Renders HTML content from the TipTap editor safely
 * Uses light mode styling only for consistent blog appearance
 */
export function ContentRenderer({ content }: ContentRendererProps) {
  // Ensure empty paragraphs are preserved for spacing
  const processedContent = content.replace(/<p><\/p>/g, '<p><br></p>');

  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
        prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-700 prose-li:mb-2
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
        prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-6"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
