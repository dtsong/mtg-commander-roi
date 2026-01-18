import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug, getAllArticleSlugs } from '@/lib/articles';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found - MTG Commander ROI',
    };
  }

  return {
    title: `${article.title} - MTG Commander ROI`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const otherArticles = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4">
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
          </header>

          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300">
            {article.content.split('\n').map((line, index) => {
              const trimmedLine = line.trim();

              if (trimmedLine.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl font-semibold text-white mt-8 mb-4">
                    {trimmedLine.replace('## ', '')}
                  </h2>
                );
              }

              if (trimmedLine.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg font-medium text-white mt-6 mb-3">
                    {trimmedLine.replace('### ', '')}
                  </h3>
                );
              }

              if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                return (
                  <p key={index} className="text-slate-300 font-semibold my-2">
                    {trimmedLine.replace(/\*\*/g, '')}
                  </p>
                );
              }

              if (trimmedLine.startsWith('- ') || trimmedLine.match(/^\d+\.\s/)) {
                return (
                  <li key={index} className="text-slate-300 ml-4">
                    {trimmedLine.replace(/^[-\d.]+\s/, '').replace(/\*\*/g, '')}
                  </li>
                );
              }

              if (trimmedLine === '') {
                return null;
              }

              return (
                <p key={index} className="text-slate-300 my-4">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        </article>

        {otherArticles.length > 0 && (
          <section className="mt-16 pt-8 border-t border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-6">More Articles</h2>
            <div className="space-y-4">
              {otherArticles.map((otherArticle) => (
                <Link
                  key={otherArticle.slug}
                  href={`/blog/${otherArticle.slug}`}
                  className="block bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-purple-500/50 transition-colors"
                >
                  <h3 className="text-white font-medium">{otherArticle.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{otherArticle.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
