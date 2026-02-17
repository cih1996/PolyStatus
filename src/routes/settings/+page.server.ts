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
      await NotificationService.createChannel(user.id, type as 'QQ' | 'BARK', name, config);
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
  },

  testConfig: async ({ request }) => {
    const data = await request.formData();
    const type = data.get('type')?.toString();

    // Auth check
    const user = await prisma.user.findUnique({ where: { username: 'demo' } });
    if (!user) return fail(401, { message: 'Unauthorized' });

    if (!type) return fail(400, { message: '缺少类型参数' });

    let config: Record<string, string> = {};

    if (type === 'QQ') {
      const token = data.get('qq_token')?.toString();
      const targetQq = data.get('qq_target')?.toString();
      if (!token || !targetQq) return fail(400, { message: '请填写 QQ 号和 Token' });

      const proxyUrl = data.get('qq_proxy')?.toString() || '';
      // Validate proxy URL to prevent SSRF
      if (proxyUrl) {
        try {
          const parsed = new URL(proxyUrl);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            return fail(400, { message: '代理地址仅支持 HTTP/HTTPS 协议' });
          }
          const hostname = parsed.hostname.toLowerCase();
          if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('10.') ||
              hostname.startsWith('192.168.') || hostname === '0.0.0.0' || hostname.startsWith('169.254.') ||
              hostname.startsWith('172.16.') || hostname.startsWith('172.17.') || hostname.startsWith('172.18.') ||
              hostname.startsWith('172.19.') || hostname.startsWith('172.2') || hostname.startsWith('172.30.') ||
              hostname.startsWith('172.31.') || hostname === '[::1]') {
            return fail(400, { message: '代理地址不允许使用内网地址' });
          }
        } catch {
          return fail(400, { message: '代理地址格式无效' });
        }
      }

      config = { token, target_qq: targetQq, proxy_url: proxyUrl };
    } else if (type === 'BARK') {
      const barkUrl = data.get('bark_url')?.toString();
      if (!barkUrl) return fail(400, { message: '请填写 Bark URL' });
      config = { bark_url: barkUrl };
    } else {
      return fail(400, { message: '不支持的类型' });
    }

    try {
      await NotificationService.testWithConfig(type as 'QQ' | 'BARK', config);
      return { success: true, message: '测试消息发送成功 ✅' };
    } catch (e: any) {
      return fail(500, { message: '测试失败: ' + e.message });
    }
  }
};

