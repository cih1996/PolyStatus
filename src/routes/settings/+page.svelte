<script lang="ts">
  import { enhance } from '$app/forms';
  import { Bell, Plus, Trash2, Send, MessageSquare, Smartphone, Check, X } from 'lucide-svelte';
  import { _ } from 'svelte-i18n';
  
  export let data;
  export let form;
  
  let isCreating = false;
  let selectedType: 'QQ' | 'BARK' = 'QQ';
  
  // 简单的提示消息逻辑
  let toastMessage: string | null = null;
  let toastType: 'success' | 'error' = 'success';

  $: if (form) {
    if (form.message) {
        toastMessage = form.message;
        toastType = form.success ? 'success' : 'error';
        setTimeout(() => toastMessage = null, 3000);
    }
    if (form.success && isCreating) {
        isCreating = false;
    }
  }
</script>

<div class="max-w-4xl mx-auto space-y-8">
    <!-- 头部 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Bell class="text-blue-600" />
                {$_('settings.title')}
            </h1>
            <p class="text-gray-500 text-sm mt-1">{$_('settings.subtitle')}</p>
        </div>
        <button 
            class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            on:click={() => isCreating = !isCreating}
        >
            {#if isCreating}
                <X size={18} /> {$_('settings.cancel_btn')}
            {:else}
                <Plus size={18} /> {$_('settings.add_btn')}
            {/if}
        </button>
    </div>

    <!-- 提示消息 -->
    {#if toastMessage}
        <div class={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 ${toastType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {toastMessage}
        </div>
    {/if}

    <!-- 新增表单 -->
    {#if isCreating}
        <div class="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6 animate-in fade-in slide-in-from-top-4">
            <h3 class="font-bold text-gray-800 mb-4">{$_('settings.add_title')}</h3>
            <form method="POST" action="?/create" use:enhance class="space-y-4">
                <!-- 类型选择 -->
                <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <label class="flex-1 cursor-pointer">
                        <input type="radio" name="type" value="QQ" class="peer sr-only" bind:group={selectedType}>
                        <div class="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-gray-100 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                            <MessageSquare size={20} />
                            <span class="font-medium">QQ Bot</span>
                        </div>
                    </label>
                    <label class="flex-1 cursor-pointer">
                        <input type="radio" name="type" value="BARK" class="peer sr-only" bind:group={selectedType}>
                        <div class="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-gray-100 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all">
                            <Smartphone size={20} />
                            <span class="font-medium">Bark (iOS)</span>
                        </div>
                    </label>
                </div>

                <!-- 名称 -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{$_('settings.alias')}</label>
                    <input name="name" type="text" placeholder={$_('settings.alias_placeholder')} class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" required>
                </div>

                <!-- QQ 配置 -->
                {#if selectedType === 'QQ'}
                    <div class="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">{$_('settings.qq_target')}</label>
                            <input name="qq_target" type="text" placeholder="e.g. 85913323" class="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">{$_('settings.qq_token')}</label>
                            <input name="qq_token" type="text" placeholder="e.g. Se&X@%V+u*uO(YH)" class="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" required>
                        </div>
                        <p class="text-xs text-gray-500">
                            {$_('settings.qq_hint')}
                        </p>
                    </div>
                {/if}

                <!-- Bark 配置 -->
                {#if selectedType === 'BARK'}
                    <div class="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">{$_('settings.bark_url')}</label>
                            <input name="bark_url" type="url" placeholder="e.g. https://api.day.app/YOUR_KEY/" class="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" required>
                        </div>
                        <p class="text-xs text-gray-500">
                            {$_('settings.bark_hint')}
                        </p>
                    </div>
                {/if}

                <div class="pt-2 flex justify-end gap-3">
                    <button type="button" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" on:click={() => isCreating = false}>{$_('settings.cancel_btn')}</button>
                    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm">{$_('settings.save')}</button>
                </div>
            </form>
        </div>
    {/if}

    <!-- 列表 -->
    <div class="space-y-4">
        {#if data.channels.length === 0}
            <div class="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell class="text-gray-400" size={24} />
                </div>
                <p class="text-gray-500">{$_('settings.no_channels')}</p>
            </div>
        {/if}

        {#each data.channels as channel}
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-200 transition-all">
                <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div class={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${channel.type === 'QQ' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {#if channel.type === 'QQ'}
                            <MessageSquare size={20} class="sm:w-6 sm:h-6" />
                        {:else}
                            <Smartphone size={20} class="sm:w-6 sm:h-6" />
                        {/if}
                    </div>
                    <div class="flex-1 sm:flex-initial min-w-0">
                        <h3 class="font-bold text-gray-800 truncate">{channel.name}</h3>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{channel.type}</span>
                            {#if channel.type === 'QQ' && channel.config && typeof channel.config === 'object' && 'target_qq' in channel.config}
                                <span class="text-xs text-gray-400 truncate hidden sm:inline-block">QQ: {channel.config.target_qq}</span>
                                <span class="text-xs text-gray-400 truncate sm:hidden">QQ: {channel.config.target_qq}</span>
                            {/if}
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2 w-full sm:w-auto border-t border-gray-50 pt-3 mt-1 sm:border-0 sm:pt-0 sm:mt-0 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                    <!-- 测试按钮 -->
                    <form method="POST" action="?/test" use:enhance class="flex-1 sm:flex-initial">
                        <input type="hidden" name="id" value={channel.id}>
                        <button 
                            type="submit" 
                            class="w-full sm:w-auto p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-1"
                            title={$_('settings.test')}
                        >
                            <Send size={16} class="sm:w-[18px] sm:h-[18px]" />
                            <span class="text-xs font-medium">{$_('settings.test')}</span>
                        </button>
                    </form>

                    <div class="hidden sm:block w-px h-4 bg-gray-200 mx-1"></div>

                    <!-- 删除按钮 -->
                    <form method="POST" action="?/delete" use:enhance class="flex-1 sm:flex-initial">
                        <input type="hidden" name="id" value={channel.id}>
                        <button 
                            type="submit" 
                            class="w-full sm:w-auto p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center"
                            on:click={(e) => !confirm($_('settings.confirm_delete')) && e.preventDefault()}
                            title={$_('settings.delete')}
                        >
                            <Trash2 size={16} class="sm:w-[18px] sm:h-[18px]" />
                            <span class="text-xs font-medium sm:hidden ml-1">{$_('settings.delete')}</span>
                        </button>
                    </form>
                </div>
            </div>
        {/each}
    </div>
</div>
