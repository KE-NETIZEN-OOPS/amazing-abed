/** @type {import('next').NextConfig} */
module.exports = (_phase, { defaultConfig }) => ({
  ...defaultConfig,
  reactStrictMode: true,
  generateBuildId: defaultConfig.generateBuildId || (() => null),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  output: 'standalone',
});
