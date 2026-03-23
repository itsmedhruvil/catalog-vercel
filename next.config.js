/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large image uploads
  api: {
    bodyParser: false,
  },
  images: {
    // Allow serving from /public/uploads
    domains: ['localhost'],
  },
}

module.exports = nextConfig
