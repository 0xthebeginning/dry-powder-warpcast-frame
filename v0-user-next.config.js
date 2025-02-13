/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ZAPPER_API_KEY: process.env.ZAPPER_API_KEY,
    NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
  },
}

module.exports = nextConfig

