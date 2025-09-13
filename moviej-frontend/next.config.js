/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  // 동적 라우팅을 사용하려면 위 줄을 주석 처리하거나 삭제해야함.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.themoviedb.org',
        port: '',
        pathname: '/**',
      },
      // KOFIC 이미지나 기타 외부 이미지 소스들을 위한 설정
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/**',
      }
    ],
    // 이전 방식과의 호환성을 위해 domains도 유지
    domains: ["image.tmdb.org", "themoviedb.org"],
    // 이미지 최적화 설정
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐시
  },
};

module.exports = nextConfig;
