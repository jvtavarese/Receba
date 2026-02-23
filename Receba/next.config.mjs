/** @type {import('next').NextConfig} */
const nextConfig = {
  // Garante que os binários nativos do Prisma (gerados em src/generated/prisma)
  // sejam incluídos no bundle de produção da Vercel
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
