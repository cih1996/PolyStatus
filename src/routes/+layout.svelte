<script lang="ts">
  import '../app.css';
  import { Home, Plus, Settings } from 'lucide-svelte';
  import { page } from '$app/stores';

  // 简单的当前页判断
  $: isHome = $page.url.pathname === '/';
  $: isAdd = $page.url.pathname.startsWith('/add');
  $: isSettings = $page.url.pathname === '/settings';
</script>

<div class="min-h-screen pb-20 bg-gray-50">
  <!-- 顶部状态栏模拟 -->
  <header class="bg-white shadow-sm sticky top-0 z-10">
    <div class="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
      <h1 class="font-bold text-lg text-blue-600">Status<span class="text-gray-800">Hub</span></h1>
      <div class="text-xs text-gray-400">v1.0</div>
    </div>
  </header>

  <!-- 主内容区域 -->
  <main class="max-w-md mx-auto px-4 py-6">
    <slot />
  </main>

  <!-- 底部导航栏 -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 pb-safe">
    <div class="max-w-md mx-auto flex justify-around items-center h-16">
      <a href="/" class="flex flex-col items-center space-y-1 {isHome ? 'text-blue-600' : 'text-gray-400'}">
        <Home size={24} />
        <span class="text-[10px] font-medium">首页</span>
      </a>
      
      <a href="/add" class="flex flex-col items-center space-y-1 {isAdd ? 'text-blue-600' : 'text-gray-400'}">
        <div class="bg-blue-50 p-2 rounded-xl -mt-6 shadow-sm border border-blue-100">
          <Plus size={28} class="text-blue-600" />
        </div>
        <span class="text-[10px] font-medium">添加</span>
      </a>

      <a href="/settings" class="flex flex-col items-center space-y-1 {isSettings ? 'text-blue-600' : 'text-gray-400'}">
        <Settings size={24} />
        <span class="text-[10px] font-medium">设置</span>
      </a>
    </div>
  </nav>
</div>

<style>
  /* iPhone X+ 底部安全区适配 */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>

