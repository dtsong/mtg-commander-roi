import { MetadataRoute } from 'next';
import { articles } from '@/lib/articles';

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mtg-commander-roi.vercel.app';

  const staticPages: { path: string; changeFrequency: ChangeFrequency }[] = [
    { path: '', changeFrequency: 'daily' },
    { path: '/compare', changeFrequency: 'weekly' },
    { path: '/about', changeFrequency: 'weekly' },
    { path: '/contact', changeFrequency: 'weekly' },
    { path: '/privacy', changeFrequency: 'weekly' },
    { path: '/terms', changeFrequency: 'weekly' },
    { path: '/blog', changeFrequency: 'weekly' },
  ];

  const staticRoutes = staticPages.map(({ path, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority: path === '' ? 1 : 0.8,
  }));

  const blogRoutes = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
