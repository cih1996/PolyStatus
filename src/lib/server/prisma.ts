import { PrismaClient } from '@prisma/client';

// 调试日志
console.log('[Prisma] Initializing client...');
console.log('[Prisma] DATABASE_URL:', process.env.DATABASE_URL ? 'Exists' : 'Missing');

// 避免在开发热重载时创建多个 Prisma 实例
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      // 显式传入 URL，优先使用 process.env，如果没有则让 Prisma 自己尝试查找
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
