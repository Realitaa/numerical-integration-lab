<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
	} from '$lib/components/ui/dropdown-menu';
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { initTheme, saveTheme, type Theme } from '$lib/stores';

	let theme = $state<Theme>(initTheme());

	function handleSetTheme(newTheme: Theme) {
		theme = newTheme;
		saveTheme(newTheme);
	}
</script>

<DropdownMenu>
	<DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>
		<div class="flex items-center gap-2">
			{#if theme === 'dark'}
				<Moon class="h-4 w-4" />
			{:else if theme === 'system'}
				<Monitor class="h-4 w-4" />
			{:else}
				<Sun class="h-4 w-4" />
			{/if}
			<span class="capitalize">{theme}</span>
		</div>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end" class="w-[140px]">
		<DropdownMenuItem onclick={() => handleSetTheme('light')}>
			<Sun class="mr-2 h-4 w-4" />
			Light
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => handleSetTheme('dark')}>
			<Moon class="mr-2 h-4 w-4" />
			Dark
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => handleSetTheme('system')}>
			<Monitor class="mr-2 h-4 w-4" />
			System
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
