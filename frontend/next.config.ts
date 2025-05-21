import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'src/assets/styles')],
    prependData: `@use "abstracts/variables" as *;`,
  },
  images: {
    domains: [
      'example.com',
      'cdnticket.melon.co.kr',
      'ticketimage.interpark.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'conkiri-bucket.s3.ap-northeast-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // SVG 파일을 React 컴포넌트로 처리하기 위한 설정
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
