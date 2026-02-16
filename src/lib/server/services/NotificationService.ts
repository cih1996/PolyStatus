import { prisma } from '../prisma';
import type { NotificationType } from '@prisma/client';

export class NotificationService {
  static async createChannel(userId: bigint, type: NotificationType, name: string, config: any) {
    return await prisma.notificationChannel.create({
      data: {
        userId,
        type,
        name,
        config
      }
    });
  }

  static async getChannels(userId: bigint) {
    return await prisma.notificationChannel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async deleteChannel(id: bigint, userId: bigint) {
    // 使用 deleteMany 配合 userId 确保安全
    return await prisma.notificationChannel.deleteMany({
      where: { id, userId }
    });
  }

  static async sendTestNotification(channelId: bigint, userId: bigint) {
    const channel = await prisma.notificationChannel.findFirst({
      where: { id: channelId, userId }
    });

    if (!channel) throw new Error('Channel not found');

    await this.send(channel, 'PolyStatus 测试', '这是一条测试消息，配置成功！🎉');
  }

  static async testWithConfig(type: 'QQ' | 'BARK', config: Record<string, string>) {
    const fakeChannel = { type, config };
    await this.send(fakeChannel, 'PolyStatus 测试', '这是一条测试消息，配置成功！🎉');
  }

  static async notifyAll(userId: bigint, title: string, message: string) {
     const channels = await prisma.notificationChannel.findMany({
         where: { userId, isEnabled: true }
     });
     
     // 并行发送，忽略错误但可以记录日志（这里简单打印）
     await Promise.allSettled(channels.map(async channel => {
         try {
             await this.send(channel, title, message);
         } catch (e) {
             console.error(`Failed to send notification to channel ${channel.id}:`, e);
         }
     }));
  }

  private static async send(channel: any, title: string, message: string) {
    const config = channel.config as any;

    if (channel.type === 'QQ') {
      await this.sendQQ(config, message);
    } else if (channel.type === 'BARK') {
      await this.sendBark(config, title, message);
    }
  }

  private static async sendQQ(config: any, text: string) {
    // 优先使用配置中的 URL，其次使用环境变量，最后使用硬编码默认值
    const proxyUrl = config.proxy_url || process.env.QQ_PROXY_URL || 'http://121.5.24.60:8999/proxy';
    const targetUrl = config.target_url || process.env.QQ_TARGET_URL || 'http://127.0.0.1:3000/send_private_msg';
    
    const token = config.token;
    const targetQq = config.target_qq;

    if (!token || !targetQq) {
        throw new Error('Missing QQ config (token or target_qq)');
    }

    const body = {
      url: targetUrl,
      post: {
        user_id: targetQq,
        message: [{
          type: "text",
          data: { text }
        }]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`QQ API Error: ${res.status} ${err}`);
    }
  }

  private static async sendBark(config: any, title: string, text: string) {
    let url = config.bark_url;
    if (!url) throw new Error('Bark URL not configured');
    
    // 简单处理 URL 格式
    if (!url.endsWith('/')) url += '/';
    if (!url.startsWith('http')) url = 'https://' + url;

    // Bark 格式: URL/title/body
    // 注意：Bark 对特殊字符可能敏感，encodeURIComponent 应该够了
    const fullUrl = `${url}${encodeURIComponent(title)}/${encodeURIComponent(text)}`;
    
    const res = await fetch(fullUrl);
    if (!res.ok) {
        throw new Error(`Bark API Error: ${res.status}`);
    }
  }
}
