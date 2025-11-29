<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';
  import { ArrowLeft, Clock, Copy, Terminal, Activity, Trash2, ChevronDown, ChevronUp } from 'lucide-svelte';
  
  export let data: PageData;
  const { monitor, apiEndpoint } = data;

  // 默认隐藏 API 指引，除非没有日志记录（新创建）
  let isApiGuideVisible = monitor.logs.length === 0;

  // 复制功能
  let copied = false;
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => copied = false, 2000);
  };
</script>

<div class="space-y-6">
  <!-- 顶部导航 -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <ArrowLeft size={20} />
      </a>
      <h1 class="font-bold text-lg text-gray-800 truncate max-w-[200px] sm:max-w-md">{monitor.name}</h1>
    </div>

    <form action="?/delete" method="POST" use:enhance>
      <button 
        type="submit" 
        class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        on:click={(e) => !confirm('确定要删除这个监控项吗？此操作不可恢复。') && e.preventDefault()}
        title="删除监控"
      >
        <Trash2 size={20} />
      </button>
    </form>
  </div>

  <!-- 状态卡片 -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center relative overflow-hidden">
    <div class={`absolute top-0 left-0 w-full h-1 ${monitor.status === 'UP' ? 'bg-green-500' : monitor.status === 'DOWN' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
    
    <div class="mt-2 mb-4">
      <span class={`inline-flex items-center justify-center w-16 h-16 rounded-full ${monitor.status === 'UP' ? 'bg-green-100 text-green-600' : monitor.status === 'DOWN' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
        <Activity size={32} />
      </span>
    </div>
    
    <h2 class={`text-2xl font-bold mb-1 ${monitor.status === 'UP' ? 'text-green-600' : monitor.status === 'DOWN' ? 'text-red-600' : 'text-gray-600'}`}>
      {monitor.status}
    </h2>
    
    <p class="text-gray-400 text-sm">
      最后检查: {monitor.lastCheckAt ? new Date(monitor.lastCheckAt).toLocaleString() : '从未'}
    </p>

    <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
      <div>
        <div class="text-xs text-gray-400 mb-1">平均延迟</div>
        <div class="font-bold text-gray-800">{monitor.lastLatency || 0}ms</div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">监控类型</div>
        <div class="font-bold text-gray-800">{monitor.type === 'ACTIVE' ? '主动' : '被动'}</div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">超时设定</div>
        <div class="font-bold text-gray-800">{monitor.timeout ? `${monitor.timeout}秒` : '未设置'}</div>
      </div>
    </div>
  </div>

  <!-- 被动监控配置指引 -->
  {#if monitor.type === 'PASSIVE' && apiEndpoint}
    <div class="bg-gray-900 rounded-xl p-5 shadow-lg text-gray-300 overflow-hidden transition-all duration-300">
      <div class="flex items-center justify-between text-gray-400">
        <button 
          class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors focus:outline-none"
          on:click={() => isApiGuideVisible = !isApiGuideVisible}
        >
          <Terminal size={14} />
          API 配置
          {#if isApiGuideVisible}
            <ChevronUp size={14} class="opacity-50" />
          {:else}
            <ChevronDown size={14} class="opacity-50" />
          {/if}
        </button>
        
        <button 
          class="text-xs hover:text-white transition-colors flex items-center gap-1"
          on:click={() => copyToClipboard(apiEndpoint)}
        >
          {#if copied}
            <span class="text-green-400">已复制</span>
          {:else}
            <Copy size={12} /> 复制 URL
          {/if}
        </button>
      </div>
      
      {#if isApiGuideVisible}
        <div class="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div class="bg-black/30 rounded p-3 font-mono text-xs break-all mb-4 border border-white/10">
            {apiEndpoint}
          </div>

          <div class="space-y-2">
            <p class="text-xs text-gray-500">Curl 示例:</p>
            <code class="block bg-black/30 rounded p-3 font-mono text-[10px] text-green-400 break-all border border-white/10">
              curl -X POST "{apiEndpoint}" \<br>
              -H "Content-Type: application/json" \<br>
              -d '&#123;"status":"UP", "latency": 45, "cpu": 80, "memory": "2GB"&#125;'
            </code>
            <p class="text-[10px] text-gray-500 mt-1">提示: 除了 status 和 latency，你可以发送任意 JSON 字段（如 cpu, memory 等），它们将显示在下方日志中。</p>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- 主动监控配置信息 -->
  {#if monitor.type === 'ACTIVE'}
    <div class="bg-blue-50 rounded-xl p-5 border border-blue-100">
      <h3 class="font-bold text-blue-800 text-sm mb-3">配置信息</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-blue-600/70">目标 URL</span>
          <span class="font-medium text-blue-900 truncate max-w-[200px]">{monitor.activeUrl}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-blue-600/70">检查频率</span>
          <span class="font-medium text-blue-900">{monitor.activeInterval}秒</span>
        </div>
        <div class="flex justify-between">
           <span class="text-blue-600/70">超时判定</span>
           <span class="font-medium text-blue-900">{monitor.timeout ? `${monitor.timeout}秒` : '未设置'}</span>
         </div>
      </div>
    </div>
  {/if}

  <!-- 日志列表 -->
  <div>
    <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
      <Clock size={18} />
      最近动态
    </h3>
    
    <div class="relative pl-4 border-l-2 border-gray-100 space-y-6">
      {#each monitor.logs as log}
        <div class="relative">
          <!-- 时间轴点 -->
          <div class={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${log.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          
          <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class={`text-xs font-bold px-1.5 py-0.5 rounded ${log.status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.status}
                  </span>
                  <span class="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                {#if log.message}
                  <p class="text-xs text-gray-600">{log.message}</p>
                {/if}
              </div>
              <div class="text-right">
                <div class="text-xs font-mono text-gray-500">{log.latency}ms</div>
                {#if log.statusCode}
                  <div class="text-[10px] text-gray-400">HTTP {log.statusCode}</div>
                {/if}
              </div>
            </div>

            <!-- 详细信息 Payload 展示 -->
            {#if log.payload && typeof log.payload === 'object' && Object.keys(log.payload).length > 0}
               <div class="mt-3 pt-2 border-t border-gray-50">
                 <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">详细数据</div>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {#each Object.entries(log.payload) as [key, value]}
                     <div class="bg-gray-50 px-2 py-1.5 rounded border border-gray-100 flex justify-between items-center">
                       <span class="text-[10px] text-gray-500 font-medium mr-2">{key}</span>
                       <span class="text-xs font-mono text-gray-800 truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                         {typeof value === 'object' ? JSON.stringify(value) : value}
                       </span>
                     </div>
                   {/each}
                 </div>
               </div>
            {/if}
          </div>
        </div>
      {/each}
      
      {#if monitor.logs.length === 0}
        <p class="text-sm text-gray-400 pl-2">暂无日志记录</p>
      {/if}
    </div>
  </div>
</div>
