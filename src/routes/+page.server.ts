import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 演示模式：确保有一个默认用户
  let user = await prisma.user.findUnique({ where: { username: 'demo' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'demo',
        passwordHash: 'demo', // 实际应加密
        email: 'demo@example.com'
      }
    });
  }

  const monitors = await prisma.monitor.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      logs: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.status === 'UP').length,
    down: monitors.filter(m => m.status === 'DOWN').length,
    pending: monitors.filter(m => m.status === 'PENDING').length
  };

  // 序列化 BigInt
  const serializedMonitors = monitors.map(m => ({
    ...m,
    id: m.id.toString(),
    userId: m.userId.toString(),
    logs: m.logs.map(l => ({
      ...l,
      id: l.id.toString(),
      monitorId: l.monitorId.toString()
    }))
  }));

  return {
    monitors: serializedMonitors,
    stats
  };
};

