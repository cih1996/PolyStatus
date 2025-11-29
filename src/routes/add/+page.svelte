<script lang="ts">
  import { enhance } from '$app/forms';
  import { Globe, Server, Check } from 'lucide-svelte';
  
  let type: 'ACTIVE' | 'PASSIVE' = 'ACTIVE';
  let loading = false;

  function setType(t: 'ACTIVE' | 'PASSIVE') {
    type = t;
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  <h2 class="text-xl font-bold text-gray-800 mb-6">添加监控项</h2>

  <form 
    method="POST" 
    use:enhance={({ formData }) => {
      // 显式设置 type，确保提交正确的值
      formData.set('type', type);
      loading = true;
      return async ({ update }) => {
        await update();
        loading = false;
      };
    }}
    class="space-y-6"
  >
    <!-- 类型选择 -->
    <div>
      <div class="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg">
        <button 
          type="button"
          class="flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all"
          class:bg-white={type === 'ACTIVE'}
          class:text-blue-600={type === 'ACTIVE'}
          class:shadow-sm={type === 'ACTIVE'}
          class:text-gray-500={type !== 'ACTIVE'}
          class:hover:text-gray-700={type !== 'ACTIVE'}
          on:click|preventDefault={() => setType('ACTIVE')}
        >
          <Globe size={16} />
          主动监控
        </button>
        <button 
          type="button"
          class="flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all"
          class:bg-white={type === 'PASSIVE'}
          class:text-purple-600={type === 'PASSIVE'}
          class:shadow-sm={type === 'PASSIVE'}
          class:text-gray-500={type !== 'PASSIVE'}
          class:hover:text-gray-700={type !== 'PASSIVE'}
          on:click|preventDefault={() => setType('PASSIVE')}
        >
          <Server size={16} />
          被动接收
        </button>
      </div>
      <!-- 为了兼容禁用 JS 的情况保留 hidden input，但在启用 JS 时会被 enhance 覆盖 -->
      <input type="hidden" name="type" value={type}>
    </div>

    <!-- 通用字段 -->
    <div class="space-y-4">
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-gray-700">监控名称</label>
        <input 
          type="text" 
          name="name" 
          id="name"
          placeholder="例如: 生产环境后端API"
          required
          class="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
        >
      </div>

      <div class="space-y-2">
        <label for="timeout" class="block text-sm font-medium text-gray-700">
           心跳超时判定 (秒)
           <span class="text-gray-400 font-normal text-xs ml-1">(可选，0 为禁用)</span>
        </label>
        <input 
          type="number" 
          name="timeout" 
          id="timeout"
          placeholder="例如: 120 (超过此时间未收到状态更新则标记为 DOWN)"
          min="0"
          class="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
        >
        <p class="text-xs text-gray-400">
          如果超过指定时间没有收到新的状态报告（或主动检查未执行），监控将被视为离线。
        </p>
      </div>
    </div>

    <!-- 主动监控特定字段 -->
    {#if type === 'ACTIVE'}
      <div class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
        <div class="space-y-2">
          <label for="url" class="block text-sm font-medium text-gray-700">目标 URL</label>
          <input 
            type="url" 
            name="url" 
            id="url"
            placeholder="https://api.example.com/health"
            required
            class="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
          >
        </div>

        <div class="space-y-2">
          <label for="interval" class="block text-sm font-medium text-gray-700">检查频率 (秒)</label>
          <select 
            name="interval" 
            id="interval"
            class="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm appearance-none"
          >
            <option value="30">30 秒</option>
            <option value="60" selected>1 分钟</option>
            <option value="300">5 分钟</option>
            <option value="600">10 分钟</option>
          </select>
        </div>

        <div class="bg-blue-50 p-4 rounded-lg text-xs text-blue-600 leading-relaxed">
          系统将每隔指定时间自动访问该 URL，如果返回 2xx 状态码则视为正常。
        </div>
      </div>
    {:else}
      <!-- 被动监控说明 -->
      <div class="bg-purple-50 p-4 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
        <h4 class="font-bold text-purple-700 text-sm mb-1">如何使用？</h4>
        <p class="text-xs text-purple-600 leading-relaxed">
          创建后，系统将生成一个专属 API Key。你需要配置你的应用或脚本定时向我们发送心跳请求。
        </p>
        <p class="text-xs text-purple-600 leading-relaxed mt-2">
          支持发送自定义 JSON 数据，将在详情页展示。
        </p>
      </div>
    {/if}

    <button 
      type="submit" 
      disabled={loading}
      class="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gray-200 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
    >
      {#if loading}
        <span class="animate-spin">⏳</span> 创建中...
      {:else}
        <Check size={18} />
        立即创建
      {/if}
    </button>
  </form>
</div>
