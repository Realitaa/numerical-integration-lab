<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as CodeBlock from '$lib/components/ui/code-block';
	import { Button } from '$lib/components/ui/button';
	import { useHighlightedCode } from '$lib/hooks/use-highlighted-code.svelte';
	import { Download, FileCode2, WrapText } from '@lucide/svelte';
	import type { MethodType } from '$lib/types';

	import trapezoidPy from '$lib/codes/trapezoid/solution.py?raw';
	import trapezoidJs from '$lib/codes/trapezoid/solution.js?raw';
	import trapezoidJava from '$lib/codes/trapezoid/solution.java?raw';
	import trapezoidCpp from '$lib/codes/trapezoid/solution.cpp?raw';
	import simpson13Py from '$lib/codes/simpson13/solution.py?raw';
	import simpson13Js from '$lib/codes/simpson13/solution.js?raw';
	import simpson13Java from '$lib/codes/simpson13/solution.java?raw';
	import simpson13Cpp from '$lib/codes/simpson13/solution.cpp?raw';
	import simpson38Py from '$lib/codes/simpson38/solution.py?raw';
	import simpson38Js from '$lib/codes/simpson38/solution.js?raw';
	import simpson38Java from '$lib/codes/simpson38/solution.java?raw';
	import simpson38Cpp from '$lib/codes/simpson38/solution.cpp?raw';
	import midpointPy from '$lib/codes/midpoint/solution.py?raw';
	import midpointJs from '$lib/codes/midpoint/solution.js?raw';
	import midpointJava from '$lib/codes/midpoint/solution.java?raw';
	import midpointCpp from '$lib/codes/midpoint/solution.cpp?raw';

	interface Props { method: MethodType }
	let { method }: Props = $props();

	const codeMap = $derived({
		trapezoid: { python: trapezoidPy, javascript: trapezoidJs, java: trapezoidJava, cpp: trapezoidCpp },
		simpson13: { python: simpson13Py, javascript: simpson13Js, java: simpson13Java, cpp: simpson13Cpp },
		simpson38: { python: simpson38Py, javascript: simpson38Js, java: simpson38Java, cpp: simpson38Cpp },
		midpoint: { python: midpointPy, javascript: midpointJs, java: midpointJava, cpp: midpointCpp },
	}[method]);

	const languageMap = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp' } as const;
	const extensionMap = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp' } as const;
	let activeLang = $state<keyof typeof languageMap>('python');
	let wrap = $state(false);
	const activeCode = $derived(codeMap[activeLang]);
	const activeLanguage = $derived(languageMap[activeLang]);
	const activeExtension = $derived(extensionMap[activeLang]);
	const lines = useHighlightedCode(() => activeCode, () => activeLanguage);

	function downloadCode() {
		const url = URL.createObjectURL(new Blob([activeCode], { type: 'text/plain' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = `solution.${activeExtension}`;
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="my-6 space-y-2">
	<h3 class="text-lg font-semibold tracking-tight">Implementasi Kode Program</h3>
	<p class="text-sm text-muted-foreground">Pelajari implementasi solusi dalam berbagai bahasa pemrograman.</p>

	<Card class="border shadow-sm">
		<CardContent class="p-4">
			<Tabs bind:value={activeLang} class="w-full">
				<TabsList class="grid grid-cols-4 w-full mb-4">
					<TabsTrigger value="python">Python</TabsTrigger>
					<TabsTrigger value="javascript">JavaScript</TabsTrigger>
					<TabsTrigger value="java">Java</TabsTrigger>
					<TabsTrigger value="cpp">C++</TabsTrigger>
				</TabsList>

				{#each ['python', 'javascript', 'java', 'cpp'] as language}
					<TabsContent value={language}>
						<CodeBlock.Root>
							<CodeBlock.Header>
								<CodeBlock.Title>
									<FileCode2 />
									solution.{extensionMap[language as keyof typeof extensionMap]}
								</CodeBlock.Title>
								<CodeBlock.Actions>
									<Button
										variant="ghost"
										size="icon-xs"
										aria-label="Bungkus baris kode"
										aria-pressed={wrap}
										class="aria-pressed:text-foreground"
										onclick={() => (wrap = !wrap)}
									>
										<WrapText />
									</Button>
									<Button variant="ghost" size="icon-xs" aria-label="Unduh kode" onclick={downloadCode}>
										<Download />
									</Button>
									<CodeBlock.CopyButton value={activeCode} />
								</CodeBlock.Actions>
							</CodeBlock.Header>
							<CodeBlock.Content {wrap} lineNumbers class="max-h-80 scroll-fade-y">
								{#each lines.current as line, index (index)}
									<CodeBlock.Line code={line} />
								{/each}
							</CodeBlock.Content>
						</CodeBlock.Root>
					</TabsContent>
				{/each}
			</Tabs>
		</CardContent>
	</Card>
</div>
