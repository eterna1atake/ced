import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
    basePath: '/cedweb',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            // Facebook CDN domains for og:image thumbnails
            {
                protocol: 'https',
                hostname: '**.fbcdn.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.facebook.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.fbsbx.com',
                pathname: '/**',
            },
        ],
    },
    output: 'standalone',
    poweredByHeader: false,
    compress: false, // Disabled to avoid Node.js stream errors; Nginx handles this.
    serverExternalPackages: ['argon2', 'mongodb'],
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    experimental: {
        optimizePackageImports: [
            '@fortawesome/react-fontawesome',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/free-brands-svg-icons',
            'aos',
        ],
    },
    reactCompiler: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
                    }
                ]
            }
        ];
    },
};

const withNextIntl = createNextIntlPlugin();

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(withNextIntl(nextConfig));
