/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除静态导出，开发模式不需要
  // output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
