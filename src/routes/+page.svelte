<script lang="ts">
  import type { PageData } from './$types';
  import { Activity, Globe, Server, Clock, AlertCircle, CheckCircle2 } from 'lucide-svelte';
  import type { MonitorStatus } from '@prisma/client';
  
  export let data: PageData;

  // 状态颜色映射
  const statusColors: Record<string, string> = {
    UP: 'bg-green-100 text-green-700 border-green-200',
    DOWN: 'bg-red-100 text-red-700 border-red-200',
    PENDING: 'bg-gray-100 text-gray-600 border-gray-200',
    MAINTENANCE: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  const statusIcons: Record<string, any> = {
    UP: CheckCircle2,
    DOWN: AlertCircle,
    PENDING: Clock,
    MAINTENANCE: Activity
  };
</script>

<!-- 统计概览 -->
<div class="grid grid-cols-3 gap-3 mb-6">
  <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
    <span class="text-xs text-gray-400 mb-1">总监控</span>
    <span class="text-xl font-bold text-gray-800">{data.stats?.total || 0}</span>
  </div>
  <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
    <span class="text-xs text-gray-400 mb-1">在线</span>
    <span class="text-xl font-bold text-green-600">{data.stats?.up || 0}</span>
  </div>
  <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
    <span class="text-xs text-gray-400 mb-1">离线</span>
    <span class="text-xl font-bold text-red-600">{data.stats?.down || 0}</span>
  </div>
</div>

<!-- 监控列表 -->
<div class="space-y-3">
  {#if !data.monitors || data.monitors.length === 0}
    <div class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
      <Activity class="w-12 h-12 text-gray-200 mx-auto mb-3" />
      <p class="text-gray-400 text-sm">暂无监控项</p>
      <a href="/add" class="text-blue-600 text-sm font-medium mt-2 inline-block">去添加一个</a>
    </div>
  {/if}

  {#each data.monitors || [] as monitor}
    <a href="/monitor/{monitor.id}" class="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <!-- 状态图标 -->
          <div class={`p-2 rounded-lg ${statusColors[monitor.status] || statusColors.PENDING}`}>
            <svelte:component this={statusIcons[monitor.status] || statusIcons.PENDING} size={18} />
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">{monitor.name}</h3>
            <div class="flex items-center gap-1 mt-0.5">
              {#if monitor.type === 'ACTIVE'}
                <Globe size={10} class="text-blue-400" />
                <span class="text-[10px] text-blue-400 font-medium bg-blue-50 px-1.5 py-0.5 rounded">主动</span>
              {:else}
                <Server size={10} class="text-purple-400" />
                <span class="text-[10px] text-purple-400 font-medium bg-purple-50 px-1.5 py-0.5 rounded">被动</span>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- 延迟显示 -->
        {#if monitor.lastLatency}
          <div class="text-right">
            <span class={`text-xs font-bold ${monitor.lastLatency > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
              {monitor.lastLatency}ms
            </span>
            <p class="text-[10px] text-gray-400">
              {monitor.lastCheckAt ? new Date(monitor.lastCheckAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
            </p>
          </div>
        {/if}
      </div>

      <!-- 底部信息 -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-50">
        <p class="text-xs text-gray-400 truncate max-w-[200px]">
          {monitor.type === 'ACTIVE' ? monitor.activeUrl : `Key: ...${monitor.passiveKey?.slice(-6)}`}
        </p>
        {#if monitor.logs && monitor.logs[0]?.message}
          <span class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full max-w-[100px] truncate">
            {monitor.logs[0].message}
          </span>
        {/if}
      </div>
    </a>
  {/each}
</div>
