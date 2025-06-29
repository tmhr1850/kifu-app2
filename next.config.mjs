/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // TailwindCSS v4 サポート
  experimental: {
    // CSS最適化は一旦無効化（安定性重視）
    // optimizeCss: true,
  },
  
  // キャッシュ最適化
  onDemandEntries: {
    // サーバーサイドキャッシュの改善
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // 開発時のパフォーマンス向上
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 開発時のキャッシュ設定改善
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: ['./next.config.mjs'],
        },
      };
    }
    return config;
  },
  
  // CSS最適化
  optimizeFonts: true,
  
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
