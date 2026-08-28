/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module — keep it out of the bundler.
  serverExternalPackages: ['better-sqlite3'],
  // The floating dev badge sits on top of the sidebar stats.
  devIndicators: false,
};
export default nextConfig;
