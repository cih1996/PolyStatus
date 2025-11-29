import { Scheduler } from '$lib/server/scheduler';
import { building } from '$app/environment';

// 仅在非构建模式下启动调度器，防止构建时挂起
if (!building) {
  Scheduler.getInstance().start();
}

