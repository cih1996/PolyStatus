import { prisma } from '../prisma';
import type { MonitorStatus, MonitorType } from '@prisma/client';
import crypto from 'crypto';
import { NotificationService } from './NotificationService';

export class MonitorService {
  /**
   * 处理监控状态更新（核心方法）
   */
  static async recordHeartbeat(
    monitorId: bigint, 
    status: MonitorStatus, 
    latency: number, 
    statusCode?: number, 
    message?: string,
    payload?: any
  ) {
    // 0. 获取旧状态
    const oldMonitor = await prisma.monitor.findUnique({
      where: { id: monitorId }
    });

    if (!oldMonitor) return;

    // 1. 写入日志
    await prisma.monitorLog.create({
      data: {
        monitorId,
        status,
        latency,
        statusCode,
        message,
        payload: payload ?? undefined
      }
    });

    // 2. 更新当前状态
    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status,
        lastCheckAt: new Date(),
        lastLatency: latency
      }
    });

    // 3. 状态变更通知
    // 只有当状态发生实质性变化时才通知
    if (oldMonitor.status !== status) {
      let title = '';
      let msg = '';
      const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

      if (status === 'DOWN') {
        // 报警：任何状态 -> DOWN
        title = `🔴 监控报警: ${oldMonitor.name}`;
        msg = `您的监控服务 [${oldMonitor.name}] 已离线！\n时间: ${time}\n原因: ${message || '未知原因'}`;
      } else if (status === 'UP' && oldMonitor.status === 'DOWN') {
        // 恢复：DOWN -> UP
        title = `🟢 恢复通知: ${oldMonitor.name}`;
        msg = `您的监控服务 [${oldMonitor.name}] 已恢复正常。\n时间: ${time}\n当前延迟: ${latency}ms`;
      }
      
      // 如果是 PENDING -> UP，通常是刚创建，不发送通知
      // 如果是 MAINTENANCE，暂时忽略

      if (title && msg) {
        // 异步发送通知，不阻塞主流程
        NotificationService.notifyAll(oldMonitor.userId, title, msg).catch(err => {
          console.error('Failed to send notification:', err);
        });
      }
    }
  }

  /**
   * 检查超时
   */
  static async checkTimeouts() {
    const monitors = await prisma.monitor.findMany({
      where: {
        timeout: { gt: 0 },
        status: { not: 'DOWN' },
        isPaused: false
      }
    });

    if (monitors.length > 0) {
      console.log(`[MonitorService] Checking heartbeats for ${monitors.length} monitors (including passive)...`);
    }

    const now = new Date();
    for (const monitor of monitors) {
      if (!monitor.lastCheckAt) continue;
      
      const diffSeconds = (now.getTime() - monitor.lastCheckAt.getTime()) / 1000;
      if (diffSeconds > monitor.timeout) {
        console.log(`[MonitorService] Monitor ${monitor.name} timed out. Last check: ${diffSeconds.toFixed(0)}s ago, Limit: ${monitor.timeout}s`);
        await this.recordHeartbeat(
          monitor.id,
          'DOWN',
          0,
          0,
          `Timeout: No heartbeat received in ${Math.floor(diffSeconds)}s (Limit: ${monitor.timeout}s)`
        );
      }
    }
  }

  /**
   * 创建被动监控
   */
  static async createPassiveMonitor(userId: bigint, name: string, description?: string, timeout: number = 0) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    return await prisma.monitor.create({
      data: {
        userId,
        name,
        description,
        type: 'PASSIVE',
        passiveKey: apiKey,
        timeout
      }
    });
  }

  /**
   * 创建主动监控
   */
  static async createActiveMonitor(
    userId: bigint, 
    name: string, 
    url: string, 
    interval: number = 60,
    method: string = 'GET',
    timeout: number = 0
  ) {
    return await prisma.monitor.create({
      data: {
        userId,
        name,
        type: 'ACTIVE',
        activeUrl: url,
        activeMethod: method,
        activeInterval: interval,
        timeout
      }
    });
  }
  
  /**
   * 获取所有需要执行的主动监控任务
   */
  static async getActiveMonitorsDue() {
    // 这里简化逻辑：获取所有未暂停且是 ACTIVE 类型的监控
    // 实际生产中可能需要更复杂的查询（根据 interval 计算下一次执行时间）
    // 为了演示，我们获取所有 ACTIVE 的，具体频率控制交由 Scheduler 内存判断或更复杂的 SQL
    return await prisma.monitor.findMany({
      where: {
        type: 'ACTIVE',
        isPaused: false
      }
    });
  }
}
