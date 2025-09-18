// components/EnhancedBlogContent.jsx
"use client";

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Custom components for ReactMarkdown
const MarkdownComponents = {
  // Code blocks with syntax highlighting
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="!my-4 !rounded-lg !overflow-x-auto"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  
  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 pl-4 py-2 italic my-4 rounded-r-lg">
      {children}
    </blockquote>
  ),
  
  // Headings
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-2">
      {children}
    </h3>
  ),
  
  // Links
  a: ({ children, href }) => (
    <a 
      href={href} 
      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline decoration-2 underline-offset-2 transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  
  // Images
  img: ({ src, alt }) => (
    <div className="my-6">
      <Image 
        src={src} 
        alt={alt}
        width={600}
        height={400}
        className="w-full max-w-2xl mx-auto rounded-lg shadow-md object-cover"
      />
      {alt && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 italic">
          {alt}
        </p>
      )}
    </div>
  ),
  
  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-inside my-4 space-y-2 pl-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside my-4 space-y-2 pl-0">
      {children}
    </ol>
  ),
  
  // Tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
      {children}
    </td>
  ),
  
  // Horizontal rule
  hr: () => (
    <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
  ),
  
  // Paragraphs
  p: ({ children }) => (
    <p className="my-4 leading-relaxed">
      {children}
    </p>
  ),

  // Preformatted text (handles <pre> tags)
  pre: ({ children }) => (
    <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
      <pre className="whitespace-pre-wrap break-words text-sm">
        {children}
      </pre>
    </div>
  ),
};

// Custom Markdown Renderer Component
const MarkdownRenderer = ({ content, onError }) => {
  const renderedContent = useMemo(() => {
    try {
      // Clean up the content first
      let cleanedContent = content || '';
      
      // Handle different content formats
      if (typeof cleanedContent === 'string') {
        // Remove HTML pre/code tags but preserve content
        cleanedContent = cleanedContent
          .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, inner) => {
            // Convert pre content to markdown code block
            return `\`\`\`\n${inner.trim()}\n\`\`\``;
          })
          .replace(/<code[^>]*>([^<]*)<\/code>/gi, (match, inner) => {
            return `\`${inner.trim()}\``;
          })
          .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
          .trim();
      }
      
      return cleanedContent;
    } catch (error) {
      console.error('Error processing markdown content:', error);
      onError?.();
      return '';
    }
  }, [content, onError]);

  if (!renderedContent) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No content available</p>
      </div>
    );
  }

  return (
    <div className="markdown-content">
      {/* ✅ FIXED: Removed className prop from ReactMarkdown */}
      <ReactMarkdown components={MarkdownComponents}>
        {renderedContent}
      </ReactMarkdown>
    </div>
  );
};

// Main EnhancedBlogContent Component
const EnhancedBlogContent = ({ blog, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  const handleRenderError = () => {
    setHasError(true);
  };

  // Ensure we have content to render
  const contentToRender = blog?.content || blog?.body || '';

  return (
    <div className={`blog-content-wrapper ${className}`}>
      <div className="prose prose-lg prose-green max-w-none text-slate-800 dark:text-slate-200 leading-relaxed overflow-hidden">
        <div className="blog-content-container relative">
          {/* Try markdown first, fallback to HTML, then plain text */}
          {contentToRender ? (
            !hasError ? (
              <MarkdownRenderer 
                content={contentToRender}
                onError={handleRenderError}
              />
            ) : (
              // Fallback: Plain text rendering
              <div className="plain-text-fallback">
                <div className="prose prose-lg prose-green max-w-none text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {contentToRender.replace(/<[^>]*>/g, '')} {/* Strip HTML tags */}
                </div>
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Content not available yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Styles for the blog content */}
      <style jsx>{`
        .blog-content-wrapper {
          max-width: 100%;
          overflow-x: auto;
        }
        
        .blog-content-container {
          max-width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          line-height: 1.7;
        }
        
        .markdown-content {
          max-width: 100%;
          overflow-x: auto;
        }
        
        .markdown-content :global(h1),
        .markdown-content :global(h2),
        .markdown-content :global(h3) {
          color: #1e293b;
        }
        
        .markdown-content :global(h1):hover,
        .markdown-content :global(h2):hover,
        .markdown-content :global(h3):hover {
          color: #059669;
        }
        
        .markdown-content :global(p) {
          color: #475569;
          margin-bottom: 1rem;
        }
        
        .markdown-content :global(blockquote) {
          border-left-color: #10b981;
          background-color: #f0fdf4;
        }
        
        .markdown-content :global(blockquote p) {
          color: #166534;
        }
        
        .markdown-content :global(a) {
          color: #10b981;
        }
        
        .markdown-content :global(a:hover) {
          color: #059669;
        }
        
        .markdown-content :global(code) {
          background-color: #f1f5f9;
          color: #475569;
        }
        
        .markdown-content :global(pre) {
          background-color: #f8fafc;
          color: #1e293b;
        }
        
        .markdown-content :global(table) {
          background-color: #ffffff;
          border-color: #e2e8f0;
        }
        
        .markdown-content :global(th) {
          background-color: #f1f5f9;
          color: #1e293b;
        }
        
        .markdown-content :global(td) {
          color: #475569;
        }
        
        /* Dark mode styles */
        .dark .markdown-content :global(h1),
        .dark .markdown-content :global(h2),
        .dark .markdown-content :global(h3) {
          color: #f1f5f9;
        }
        
        .dark .markdown-content :global(p) {
          color: #cbd5e1;
        }
        
        .dark .markdown-content :global(blockquote) {
          background-color: #064e3b;
          border-left-color: #34d399;
        }
        
        .dark .markdown-content :global(blockquote p) {
          color: #d1fae5;
        }
        
        .dark .markdown-content :global(a) {
          color: #34d399;
        }
        
        .dark .markdown-content :global(a:hover) {
          color: #10b981;
        }
        
        .dark .markdown-content :global(code) {
          background-color: #334155;
          color: #e2e8f0;
        }
        
        .dark .markdown-content :global(pre) {
          background-color: #0f172a;
          color: #f1f5f9;
        }
        
        .dark .markdown-content :global(table) {
          background-color: #1e293b;
          border-color: #475569;
        }
        
        .dark .markdown-content :global(th) {
          background-color: #334155;
          color: #f1f5f9;
        }
        
        .dark .markdown-content :global(td) {
          color: #cbd5e1;
        }
        
        .plain-text-fallback {
          max-width: 100%;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          line-height: 1.7;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #475569;
        }
        
        .empty-state {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Responsive table handling */
        @media (max-width: 768px) {
          .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
          }
          
          .blog-content-container {
            font-size: 0.95em;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedBlogContent;