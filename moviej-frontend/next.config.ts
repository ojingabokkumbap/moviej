import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API 프록시 설정 (개발 환경에서 CORS 문제 해결)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ];
  },
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 이미지 최적화 설정
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐시
  },

  // SVG 컴포넌트 import를 위한 webpack 설정
  webpack(config) {
    // 기존 svg 처리에서 제외 (file-loader 등)
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test && rule.test.test && rule.test.test('.svg')
    );
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }
    
    // svgr: js/ts(x)에서만 동작하도록
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },

  // 실험적 기능들
  experimental: {
    optimizeCss: true, // CSS 최적화
    scrollRestoration: true, // 스크롤 복원
  },

  // 컴파일러 옵션
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  
  // 성능 최적화
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
};

export default nextConfig;
