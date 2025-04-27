/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.pexels.com", // ✅ Cho phép ảnh từ Pexels
      "localhost", // ✅ Cho phép ảnh từ localhost
      "127.0.0.1", // ✅ Cho phép ảnh từ localhost IP
      "img.clerk.com", // ✅ Cho phép ảnh từ Clerk
      "images.clerk.dev", // ✅ Cho phép ảnh từ Clerk
      "picsum.photos", // ✅ Cho phép ảnh từ Lorem Picsum
      "via.placeholder.com", // ✅ Cho phép ảnh từ Placeholder
      "placehold.co", // ✅ Cho phép ảnh từ Placehold
      "placekitten.com", // ✅ Cho phép ảnh từ PlaceKitten
      "unsplash.com", // ✅ Cho phép ảnh từ Unsplash
      "images.unsplash.com", // ✅ Cho phép ảnh từ Unsplash
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      }
    ],
  },
};

module.exports = nextConfig;
