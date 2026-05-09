/** @type {import('next').NextConfig} */

// https:// 없으면 자동으로 붙임
function getApiUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `https://${raw}`;
}

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${getApiUrl()}/api/:path*`,
      },
    ];
  },
  images: {
    domains: ['spoonacular.com'],
  },
};

module.exports = nextConfig;
