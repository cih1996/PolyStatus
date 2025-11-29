import { error, redirect, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
  const id = BigInt(params.id);
  
  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: {
      logs: {
        take: 50,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!monitor) throw error(404, 'Monitor not found');

  // 构造 API Endpoint (仅用于被动监控展示)
  const apiEndpoint = monitor.type === 'PASSIVE' 
    ? `${url.origin}/api/v1/push/${monitor.passiveKey}`
    : null;

  return {
    monitor: {
      ...monitor,
      id: monitor.id.toString(),
      userId: monitor.userId.toString(),
      logs: monitor.logs.map(l => ({
        ...l,
        id: l.id.toString(),
        monitorId: l.monitorId.toString()
      }))
    },
    apiEndpoint
  };
};

export const actions: Actions = {
  delete: async ({ params }) => {
    const id = BigInt(params.id);
    try {
      await prisma.monitor.delete({
        where: { id }
      });
    } catch (e) {
      console.error(e);
      return fail(500, { message: 'Failed to delete monitor' });
    }
    throw redirect(303, '/');
  }
};
