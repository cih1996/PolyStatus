<script lang="ts">
  import { enhance } from '$app/forms';
  import { Globe, Server, Check } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';

  let type: 'ACTIVE' | 'PASSIVE' = 'ACTIVE';
  let loading = false;

  function setType(t: 'ACTIVE' | 'PASSIVE') {
    type = t;
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  <h2 class="text-xl font-bold text-gray-800 mb-6">{$_('add.title')}</h2>

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
          {$_('add.type_active')}
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
          {$_('add.type_passive')}
        </button>
      </div>
      <!-- 为了兼容禁用 JS 的情况保留 hidden input，但在启用 JS 时会被 enhance 覆盖 -->
      <input type="hidden" name="type" value={type}>
    </div>

    <!-- 通用字段 -->
    <div class="space-y-4">
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-gray-700">{$_('add.name')}</label>
        <input 
          type="text" 
          name="name" 
          id="name"
          placeholder={$_('add.name_placeholder')}
          required
          class="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
        >
      </div>

      <div class="space-y-2">
        <label for="timeout" class="block text-sm font-medium text-gray-700">
           {$_('add.timeout')}
           <span class="text-gray-400 font-normal text-xs ml-1">({$_('add.timeout_hint')})</span>
        </label>
        <input 
          type="number" 
          name="timeout" 
          id="timeout"
          placeholder={$_('add.timeout_desc')}
          min="0"
          class="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
        >
        <p class="text-xs text-gray-400">
          {$_('add.timeout_desc')}
        </p>
      </div>
    </div>

    <!-- 主动监控特定字段 -->
    {#if type === 'ACTIVE'}
      <div class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
        <div class="space-y-2">
          <label for="url" class="block text-sm font-medium text-gray-700">{$_('add.url')}</label>
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
          <label for="interval" class="block text-sm font-medium text-gray-700">{$_('add.interval')}</label>
          <select 
            name="interval" 
            id="interval"
            class="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm appearance-none"
          >
            <option value="30">30 s</option>
            <option value="60" selected>1 min</option>
            <option value="300">5 min</option>
            <option value="600">10 min</option>
          </select>
        </div>

        <div class="bg-blue-50 p-4 rounded-lg text-xs text-blue-600 leading-relaxed">
          {$_('add.interval_hint')}
        </div>
      </div>
    {:else}
      <!-- 被动监控说明 -->
      <div class="bg-purple-50 p-4 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
        <h4 class="font-bold text-purple-700 text-sm mb-1">{$_('add.how_to_use')}</h4>
        <p class="text-xs text-purple-600 leading-relaxed">
          {$_('add.passive_desc_1')}
        </p>
        <p class="text-xs text-purple-600 leading-relaxed mt-2">
          {$_('add.passive_desc_2')}
        </p>
      </div>
    {/if}

    <button 
      type="submit" 
      disabled={loading}
      class="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gray-200 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
    >
      {#if loading}
        <span class="animate-spin">⏳</span> {$_('add.creating')}
      {:else}
        <Check size={18} />
        {$_('add.create_btn')}
      {/if}
    </button>
  </form>
</div>
