import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { articles } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'Blog - MTG Commander ROI',
  description: 'Articles, guides, and tips for getting the best value from Magic: The Gathering Commander preconstructed decks.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Blog</h1>
        <p className="text-slate-300 mb-8">
          Guides, tips, and insights for getting the best value from Commander precons.
        </p>

        {articles.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-400">No articles yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="block bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-purple-500/50 transition-colors"
              >
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400">
                  {article.title}
                </h2>
                <p className="text-slate-300 mb-4">{article.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
