/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "bidpro-auction-pics.s3.us-east-1.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;
