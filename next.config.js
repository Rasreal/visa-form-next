/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  // Ensure that the API routes can properly handle file uploads
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
}

module.exports = nextConfig 