import { error, json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { MonitorService } from '$lib/server/services/MonitorService';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
  const { key } = params;
  
  if (!key) {
    throw error(400, 'Missing API Key');
  }

  // 1. 验证 Key
  const monitor = await prisma.monitor.findUnique({
    where: { passiveKey: key }
  });

  if (!monitor) {
    throw error(404, 'Monitor not found');
  }

  if (monitor.type !== 'PASSIVE') {
    throw error(400, 'Not a passive monitor');
  }

  // 2. 解析请求体 (支持用户自定义简单的上报数据)
  let body: any;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const status = body.status === 'DOWN' ? 'DOWN' : 'UP';
  const latency = body.latency || 0;
  const message = body.message || 'Heartbeat received';
  
  // 提取其余字段作为 payload
  const { status: _s, latency: _l, message: _m, ...payload } = body;

  // 3. 记录状态
  await MonitorService.recordHeartbeat(
    monitor.id,
    status,
    latency,
    200,
    message,
    payload
  );

  return json({ success: true });
};
