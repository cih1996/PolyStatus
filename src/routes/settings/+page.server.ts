import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { NotificationService } from '$lib/server/services/NotificationService';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 这里假设当前用户是 demo (为了保持上下文一致性)
  const user = await prisma.user.findUnique({ where: { username: 'demo' } });
  
  if (!user) {
    // 如果没用户，可能需要处理初始化
    return { channels: [] };
  }

  const channels = await NotificationService.getChannels(user.id);
  
  return {
    channels: channels.map(c => ({
      ...c,
      id: c.id.toString(),
      userId: c.userId.toString(),
      // config 本身是 JsonValue，这里无需特殊处理，SvelteKit 会序列化
    }))
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const type = data.get('type')?.toString();
    const name = data.get('name')?.toString();
    
    const user = await prisma.user.findUnique({ where: { username: 'demo' } });
    if (!user) return fail(401, { message: 'Unauthorized' });

    if (!name || !type) return fail(400, { message: '缺少必要字段' });

    let config = {};
    
    if (type === 'QQ') {
        const token = data.get('qq_token')?.toString();
        const targetQq = data.get('qq_target')?.toString();
        if (!token || !targetQq) return fail(400, { message: '请填写完整的 QQ 配置' });
        
        config = { 
            token, 
            target_qq: targetQq,
            // 可选的高级配置，如果将来前端提供输入框
            proxy_url: data.get('qq_proxy')?.toString(), 
        };
    } else if (type === 'BARK') {
        const barkUrl = data.get('bark_url')?.toString();
        if (!barkUrl) return fail(400, { message: '请填写 Bark URL' });
        config = { bark_url: barkUrl };
    }

    try {
      await NotificationService.createChannel(user.id, type as any, name, config);
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { message: '创建失败' });
    }
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const idStr = data.get('id')?.toString();
    
    const user = await prisma.user.findUnique({ where: { username: 'demo' } });
    if (!user || !idStr) return fail(400);

    try {
        await NotificationService.deleteChannel(BigInt(idStr), user.id);
        return { success: true };
    } catch (e) {
        return fail(500, { message: '删除失败' });
    }
  },

  test: async ({ request }) => {
    const data = await request.formData();
    const idStr = data.get('id')?.toString();
    
    const user = await prisma.user.findUnique({ where: { username: 'demo' } });
    if (!user || !idStr) return fail(400);

    try {
        await NotificationService.sendTestNotification(BigInt(idStr), user.id);
        return { success: true, message: '测试消息已发送' };
    } catch (e: any) {
        return fail(500, { message: '发送失败: ' + e.message });
    }
  }
};

