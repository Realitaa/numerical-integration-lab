<script lang="ts">
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { initTheme, saveTheme, type Theme } from '$lib/stores';

	let theme = $state<Theme>(initTheme());

	function handleSetTheme(newTheme: Theme) {
		theme = newTheme;
		saveTheme(newTheme);
	}
</script>

<Tabs
	value={theme}
	onValueChange={(value) => handleSetTheme(value as Theme)}
	class="w-full"
>
	<TabsList class="grid w-full grid-cols-3" aria-label="Pilih tema">
		<TabsTrigger value="light" class="gap-1.5 px-2 text-xs" aria-label="Tema terang">
			<Sun class="h-3.5 w-3.5" />
			<span>Terang</span>
		</TabsTrigger>
		<TabsTrigger value="dark" class="gap-1.5 px-2 text-xs" aria-label="Tema gelap">
			<Moon class="h-3.5 w-3.5" />
			<span>Gelap</span>
		</TabsTrigger>
		<TabsTrigger value="system" class="gap-1.5 px-2 text-xs" aria-label="Tema sistem">
			<Monitor class="h-3.5 w-3.5" />
			<span>Sistem</span>
		</TabsTrigger>
	</TabsList>
</Tabs>
