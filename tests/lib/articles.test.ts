import { describe, it, expect } from 'vitest';
import { getArticleBySlug, getAllArticleSlugs, articles } from '@/lib/articles';

describe('getArticleBySlug', () => {
  it('finds article by slug', () => {
    const article = getArticleBySlug('what-is-commander-precon-roi');
    expect(article).toBeDefined();
    expect(article?.title).toBe('What is Commander Precon ROI?');
  });

  it('returns undefined for non-existent slug', () => {
    const article = getArticleBySlug('nonexistent-article');
    expect(article).toBeUndefined();
  });

  it('returns article with all required properties', () => {
    const article = getArticleBySlug('how-to-use-mtg-commander-roi');
    expect(article).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      publishedAt: expect.any(String),
      author: expect.any(String),
      tags: expect.any(Array),
      content: expect.any(String),
    });
  });

  it('handles slug with hyphens correctly', () => {
    const article = getArticleBySlug('understanding-card-conditions');
    expect(article).toBeDefined();
    expect(article?.slug).toBe('understanding-card-conditions');
  });
});

describe('getAllArticleSlugs', () => {
  it('returns all article slugs', () => {
    const slugs = getAllArticleSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs).toContain('what-is-commander-precon-roi');
    expect(slugs).toContain('how-to-use-mtg-commander-roi');
  });

  it('returns only strings', () => {
    const slugs = getAllArticleSlugs();
    expect(slugs.every(s => typeof s === 'string')).toBe(true);
  });

  it('returns same count as articles array', () => {
    const slugs = getAllArticleSlugs();
    expect(slugs.length).toBe(articles.length);
  });
});

describe('articles array', () => {
  it('has at least 3 articles', () => {
    expect(articles.length).toBeGreaterThanOrEqual(3);
  });

  it('all articles have valid date format', () => {
    for (const article of articles) {
      expect(article.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('all articles have non-empty content', () => {
    for (const article of articles) {
      expect(article.content.trim().length).toBeGreaterThan(0);
    }
  });

  it('all articles have at least one tag', () => {
    for (const article of articles) {
      expect(article.tags.length).toBeGreaterThan(0);
    }
  });

  it('all slugs are unique', () => {
    const slugs = articles.map(a => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
