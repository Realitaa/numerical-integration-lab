<script lang="ts">
	import { Math as MathRender } from 'svelte-math';
	import type { MethodType, FunctionType, ComputationResult } from '$lib/types';
	import { computeIntegration, functionList, getFunctionName } from '$lib/mathUtils';
	import { ResizablePaneGroup, ResizablePane, ResizableHandle } from '$lib/components/ui/resizable';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	interface Props {
		method: MethodType;
		onResultChange?: (res: ComputationResult) => void;
	}

	let { method, onResultChange }: Props = $props();
	let selectedFunction = $state<FunctionType>('x^2');
	let lowerBound = $state<number>(0);
	let upperBound = $state<number>(2);
	let subintervals = $state<number>(4);

	$effect(() => {
		if (method === 'simpson13' && subintervals % 2 !== 0) {
			subintervals = Math.max(2, Math.ceil(subintervals / 2) * 2);
		}
		if (method === 'simpson38' && subintervals % 3 !== 0) {
			subintervals = Math.max(3, Math.ceil(subintervals / 3) * 3);
		}
	});

	const result = $derived(computeIntegration(method, selectedFunction, lowerBound, upperBound, subintervals));

	$effect(() => {
		onResultChange?.(result);
	});

	const fnLatex = $derived(getFunctionName(selectedFunction));
	const stepSizeLatex = $derived(`h = \\frac{${upperBound} - (${lowerBound})}{${result.n}} = ${result.h.toFixed(6)}`);
	const integralLatex = $derived(`I = \\int_{${lowerBound}}^{${upperBound}} ${fnLatex}\\,dx`);
	const resultLatex = $derived(`I_{\\text{pendekatan}} \\approx ${result.approximation.toFixed(8)}`);
	const exactLatex = $derived(`I_{\\text{eksak}} \\approx ${result.exact.toFixed(8)}`);
	const errorLatex = $derived(`\\text{Galat Mutlak} = |I_{\\text{pendekatan}} - I_{\\text{eksak}}| = ${result.error.toExponential(4)}`);
	const relErrorLatex = $derived(`\\text{Galat Relatif} = ${(result.relativeError * 100).toFixed(4)}\\%`);
</script>

{#snippet inputFields()}
	<div class="space-y-4">
		<div class="font-semibold text-sm border-b pb-2">Parameter Input</div>

		<div class="space-y-1.5">
			<Label for="function-select" class="text-xs">Fungsi f(x)</Label>
			<Select type="single" bind:value={selectedFunction as string}>
				<SelectTrigger id="function-select"><SelectValue placeholder="Pilih fungsi" /></SelectTrigger>
				<SelectContent>
					{#each functionList as fn}
						<SelectItem value={fn.id}>{fn.label} — ({fn.description})</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5">
				<Label for="lower-bound" class="text-xs">Batas Bawah (a)</Label>
				<Input id="lower-bound" type="number" step="any" bind:value={lowerBound} />
			</div>
			<div class="space-y-1.5">
				<Label for="upper-bound" class="text-xs">Batas Atas (b)</Label>
				<Input id="upper-bound" type="number" step="any" bind:value={upperBound} />
			</div>
		</div>

		<div class="space-y-1.5">
			<div class="flex justify-between items-center gap-2">
				<Label for="subintervals" class="text-xs">Jumlah Subinterval (n)</Label>
				{#if method === 'simpson13'}
					<Badge variant="outline" class="text-[10px] px-1 py-0">Harus Genap</Badge>
				{:else if method === 'simpson38'}
					<Badge variant="outline" class="text-[10px] px-1 py-0">Kelipatan 3</Badge>
				{/if}
			</div>
			<Input
				id="subintervals"
				type="number"
				min={method === 'simpson13' ? 2 : method === 'simpson38' ? 3 : 1}
				step={method === 'simpson13' ? 2 : method === 'simpson38' ? 3 : 1}
				bind:value={subintervals}
			/>
		</div>

		<div class="bg-muted/40 p-3 rounded-md text-xs space-y-1 text-muted-foreground border">
			<div class="flex justify-between"><span>Ukuran Langkah (h):</span><span class="font-mono font-medium">{result.h.toFixed(6)}</span></div>
			<div class="flex justify-between"><span>Subinterval Valid (n):</span><span class="font-mono font-medium">{result.n}</span></div>
		</div>
	</div>
{/snippet}

{#snippet resultsPanel()}
	<div class="space-y-4 text-sm">
		<div class="bg-card p-3 rounded-md border shadow-2xs">
			<span class="text-xs text-muted-foreground font-semibold block mb-1">Bentuk Integral Target</span>
			<div class="py-1"><MathRender latex={integralLatex} displayMode={true} /></div>
		</div>

		<div class="bg-card p-3 rounded-md border shadow-2xs">
			<span class="text-xs text-muted-foreground font-semibold block mb-1">Perhitungan Ukuran Langkah (h)</span>
			<div class="py-1"><MathRender latex={stepSizeLatex} displayMode={false} /></div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			<div class="bg-card p-3 rounded-md border shadow-2xs space-y-1">
				<span class="text-xs text-muted-foreground font-semibold">Hasil Pendekatan Numerik</span>
				<div class="py-1"><MathRender latex={resultLatex} displayMode={false} /></div>
			</div>
			<div class="bg-card p-3 rounded-md border shadow-2xs space-y-1">
				<span class="text-xs text-muted-foreground font-semibold">Nilai Referensi Eksak</span>
				<div class="py-1"><MathRender latex={exactLatex} displayMode={false} /></div>
			</div>
		</div>

		<div class="bg-card p-3 rounded-md border shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-3">
			<div><span class="text-xs text-muted-foreground font-semibold block mb-1">Galat Mutlak</span><MathRender latex={errorLatex} displayMode={false} /></div>
			<div><span class="text-xs text-muted-foreground font-semibold block mb-1">Galat Relatif</span><MathRender latex={relErrorLatex} displayMode={false} /></div>
		</div>

		<div class="bg-card p-3 rounded-md border shadow-2xs space-y-2">
			<span class="text-xs text-muted-foreground font-semibold block">Rincian Kontribusi Setiap Subinterval</span>
			<ScrollArea class="h-48 border rounded-md">
				<table class="w-full text-xs text-left">
					<thead class="bg-muted text-muted-foreground border-b sticky top-0">
						<tr><th class="p-2 font-medium">#</th><th class="p-2 font-medium">Subinterval [x_a, x_b]</th><th class="p-2 font-medium">f(x_a)</th><th class="p-2 font-medium">f(x_b)</th><th class="p-2 font-medium text-right">Kontribusi</th></tr>
					</thead>
					<tbody class="divide-y">
						{#each result.stepDetails as step}
							<tr class="hover:bg-muted/50 font-mono"><td class="p-2">{step.index + 1}</td><td class="p-2">[{step.a.toFixed(4)}, {step.b.toFixed(4)}]</td><td class="p-2">{step.yA.toFixed(4)}</td><td class="p-2">{step.yB.toFixed(4)}</td><td class="p-2 text-right font-semibold">{step.contribution.toFixed(6)}</td></tr>
						{/each}
					</tbody>
				</table>
			</ScrollArea>
		</div>
	</div>
{/snippet}

<div class="my-6 space-y-2">
	<h3 class="text-lg font-semibold tracking-tight">Kalkulator Integrasi Interaktif</h3>
	<p class="text-sm text-muted-foreground">Ubah batas integrasi, fungsi, dan jumlah subinterval untuk melihat hasil perhitungan matematis langkah demi langkah secara real-time.</p>

	<!-- Desktop: resizable two-column calculator -->
	<Card class="hidden md:block border shadow-sm overflow-hidden">
		<ResizablePaneGroup direction="horizontal" class="min-h-[420px] w-full rounded-lg border">
			<ResizablePane defaultSize={35} minSize={25} maxSize={50} class="p-4 bg-card border-r">
				{@render inputFields()}
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={65} class="p-4 bg-muted/20 overflow-y-auto">
				<div class="font-semibold text-sm border-b pb-2 mb-4">Hasil Perhitungan Langkah demi Langkah</div>
				{@render resultsPanel()}
			</ResizablePane>
		</ResizablePaneGroup>
	</Card>

	<!-- Mobile: normal vertical flow, no resizable panes -->
	<Card class="md:hidden border shadow-sm overflow-hidden">
		<div class="p-4 bg-card">{@render inputFields()}</div>
		<div class="border-t p-4 bg-muted/20">
			<div class="font-semibold text-sm border-b pb-2 mb-4">Hasil Perhitungan Langkah demi Langkah</div>
			{@render resultsPanel()}
		</div>
	</Card>
</div>
