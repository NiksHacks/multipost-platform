/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['platform-lookaside.fbsbx.com', 'scontent.cdninstagram.com', 'i.ytimg.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig