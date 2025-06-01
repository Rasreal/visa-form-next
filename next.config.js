/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Ensure that the API routes can properly handle file uploads
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
    // API limits moved here from the invalid 'api' key
    bodyParserLimit: '10mb',
    responseLimit: '10mb',
  },
  
  // Configure headers to handle CORS properly
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
}

module.exports = nextConfig 