/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
  basePath: '',
  output: 'standalone',
  // ইমেজগুলি বাইরের লিংক থেকে লোড করার অনুমতি দেওয়া হল
  experimental: {
    // এখানে কোন উন্নত ফিচার যুক্ত করা যেতে পারে যদি প্রয়োজন হয়
  },
};

export default nextConfig; 