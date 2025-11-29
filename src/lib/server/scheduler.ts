import { MonitorService } from './services/MonitorService';
import { prisma } from './prisma';

/**
 * 简易的内存调度器。
 * 在生产环境中，建议替换为 BullMQ + Redis 以支持多实例部署。
 */
export class Scheduler {
  private static instance: Scheduler;
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler();
    }
    return Scheduler.instance;
  }

  public start() {
    if (this.isRunning) return;
    console.log('Starting Active Monitor Scheduler...');
    this.isRunning = true;

    // 每 10 秒扫描一次需要执行的任务
    // 这是一个简化的实现。更严谨的做法是使用 Priority Queue
    this.interval = setInterval(() => this.tick(), 10000);
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
    this.isRunning = false;
  }

  private async tick() {
    const now = new Date();
    console.log(`[Scheduler] Tick at ${now.toLocaleTimeString()}`);
    
    try {
      // Check for timeouts
      await MonitorService.checkTimeouts();

      // 获取所有主动监控
      const monitors = await MonitorService.getActiveMonitorsDue();
      
      if (monitors.length > 0) {
        console.log(`[Scheduler] Found ${monitors.length} active monitors due for check.`);
      }
      
      for (const monitor of monitors) {
        this.checkUrl(monitor);
      }
    } catch (e) {
      console.error('[Scheduler] Tick error:', e);
    }
  }

  private async checkUrl(monitor: any) {
    // 简单的频率限制检查：如果上次检查时间 + 间隔 > 现在，则跳过
    if (monitor.lastCheckAt) {
        const nextCheck = new Date(monitor.lastCheckAt.getTime() + (monitor.activeInterval || 60) * 1000);
        // 稍微放宽一点判断，防止因为执行耗时导致无限跳过，或者精确判断
        if (nextCheck > new Date()) {
            // Log verbose only if needed, otherwise skip to avoid noise
            return;
        }
    }

    console.log(`[Scheduler] Checking ${monitor.name} (${monitor.activeUrl})...`);
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), (monitor.activeTimeout || 10) * 1000);

      const response = await fetch(monitor.activeUrl!, {
        method: monitor.activeMethod || 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - start;

      // Try to parse payload
      let payload = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
          try {
              payload = await response.json();
          } catch (e) {
              // ignore
          }
      }

      await MonitorService.recordHeartbeat(
        monitor.id,
        response.ok ? 'UP' : 'DOWN',
        latency,
        response.status,
        response.statusText,
        payload
      );
      
      console.log(`[Scheduler] Checked ${monitor.name}: ${response.status} ${response.statusText} (${latency}ms)`);

    } catch (error: any) {
      const latency = Date.now() - start;
      console.error(`[Scheduler] Check failed for ${monitor.name}:`, error.message);
      
      await MonitorService.recordHeartbeat(
        monitor.id,
        'DOWN',
        latency,
        0,
        error.message
      );
    }
  }
}
