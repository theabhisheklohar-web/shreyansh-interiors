/** @type {import('next').NextConfig} */
const nextConfig = {
  // Yeh line Next.js ko bolegi ki build ke time par errors ko ignore kare
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Yeh line TypeScript errors ko bhi ignore karegi agar koi hui toh
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;