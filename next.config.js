/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用静态导出，输出到 out 目录
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
