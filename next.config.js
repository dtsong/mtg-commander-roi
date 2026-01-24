const optionalEnvVars = [
  { key: 'NEXT_PUBLIC_ADSENSE_CLIENT_ID', feature: 'Google AdSense ads' },
  { key: 'NEXT_PUBLIC_FORMSPREE_ID', feature: 'Contact form submissions' },
  { key: 'JUSTTCG_API_KEY', feature: 'JustTCG price source' },
];

const missing = optionalEnvVars.filter(v => !process.env[v.key]);
if (missing.length > 0) {
  console.warn('\n⚠ Optional environment variables not set:');
  missing.forEach(v => console.warn(`  - ${v.key}: ${v.feature} disabled`));
  console.warn('');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // CSP is set dynamically in middleware.ts with per-request nonce
        ],
      },
    ];
  },
};

export default nextConfig;
