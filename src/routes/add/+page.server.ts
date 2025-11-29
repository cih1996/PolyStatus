import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { MonitorService } from '$lib/server/services/MonitorService';
import { prisma } from '$lib/server/prisma';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString();
    const type = data.get('type')?.toString();
    const timeoutStr = data.get('timeout')?.toString();
    const timeout = timeoutStr ? parseInt(timeoutStr) : 0;
    
    // 这里简化获取用户 ID 逻辑
    const user = await prisma.user.findUnique({ where: { username: 'demo' } });
    if (!user) return fail(401, { message: 'Unauthorized' });

    if (!name || !type) {
      return fail(400, { message: 'Name and type are required' });
    }

    try {
      if (type === 'ACTIVE') {
        const url = data.get('url')?.toString();
        const interval = parseInt(data.get('interval')?.toString() || '60');
        
        if (!url) return fail(400, { message: 'URL is required for active monitors' });
        
        await MonitorService.createActiveMonitor(user.id, name, url, interval, 'GET', timeout);
      } else {
        await MonitorService.createPassiveMonitor(user.id, name, undefined, timeout);
      }
    } catch (error) {
      console.error(error);
      return fail(500, { message: 'Failed to create monitor' });
    }

    throw redirect(303, '/');
  }
};
