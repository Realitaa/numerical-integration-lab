<script lang="ts">
	import { Math as MathRender } from 'svelte-math';
	import type { MethodType, FunctionType, ComputationResult } from '$lib/types';
	import { computeIntegration, getFunctionName } from '$lib/mathUtils';
	import { getDefaultFunctionForMethod, getFunctionsForMethod, functionRegistry, getMethodFunctionConfig } from '$lib/functionRegistry';
	import { ResizablePaneGroup, ResizablePane, ResizableHandle } from '$lib/components/ui/resizable';
	import { Card } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	interface Props {
		method: MethodType;
		onResultChange?: (res: ComputationResult) => void;
	}

	let { method, onResultChange }: Props = $props();
	const methodFunctionConfig = $derived(getMethodFunctionConfig(method));
	let selectedFunction = $state<FunctionType>('x^2 + 1');
	let lowerBound = $state<number>(0);
	let upperBound = $state<number>(2);
	let subintervals = $state<number>(1);

	$effect.pre(() => {
		const { defaultFunctionId, defaults } = methodFunctionConfig;
		selectedFunction = defaultFunctionId;
		lowerBound = defaults.a;
		upperBound = defaults.b;
		subintervals = defaults.n;
	});

	const calculation = $derived.by(() => {
		try {
			return { result: computeIntegration(method, selectedFunction, lowerBound, upperBound, subintervals), error: '' };
		} catch (error) {
			return { result: null, error: error instanceof Error ? error.message : 'Parameter tidak valid.' };
		}
	});
	const result = $derived(calculation.result);
	const calculationError = $derived(calculation.error);

	$effect(() => {
		if (result) onResultChange?.(result);
	});

	const fnLatex = $derived(getFunctionName(selectedFunction));
	const availableFunctions = $derived(getFunctionsForMethod(method).map((id) => ({
		id,
		label: functionRegistry[id].label,
		description: functionRegistry[id].description,
	})));
	const functionSelectionMode = $derived(methodFunctionConfig.selectionMode);
	const selectedFunctionDefinition = $derived(functionRegistry[selectedFunction]);
	const stepSizeLatex = $derived(result ? `h = \\frac{${upperBound} - (${lowerBound})}{${result.n}} = ${result.h.toFixed(6)}` : 'Parameter tidak valid');
	const integralLatex = $derived(`I = \\int_{${lowerBound}}^{${upperBound}} ${fnLatex}\\,dx`);
	const resultLatex = $derived(result ? `I_{\\text{pendekatan}} \\approx ${result.approximation.toFixed(8)}` : '');
	const referenceLatex = $derived(result ? `I_{\\text{referensi}} \\approx ${result.referenceValue.toFixed(8)}` : '');
	const errorLatex = $derived(result ? `\\text{Galat Mutlak} = |I_{\\text{pendekatan}} - I_{\\text{referensi}}| = ${result.error.toExponential(4)}` : '');
	const relErrorLatex = $derived(result?.relativeError === null ? '\\text{N/A (nilai referensi nol)}' : `\\text{Galat Relatif} = ${((result?.relativeError ?? 0) * 100).toFixed(4)}\\%`);
</script>

{#snippet inputFields(idSuffix: string)}
	<div class="space-y-4">
		<div class="font-semibold text-sm border-b pb-2">Parameter Input</div>

		<div class="space-y-1.5">
			<Label for={`${idSuffix}-function-select`} class="text-xs">Fungsi f(x)</Label>
			{#if functionSelectionMode === 'static'}
				<div id={`${idSuffix}-function-select`} class="rounded-lg border bg-muted/40 px-3 py-2 text-sm" aria-live="polite">
					<span class="font-medium">{selectedFunctionDefinition.label}</span>
					<span class="text-muted-foreground"> — {selectedFunctionDefinition.description}</span>
				</div>
			{:else}
				<Select type="single" bind:value={selectedFunction}>
					<SelectTrigger id={`${idSuffix}-function-select`}><SelectValue placeholder="Pilih fungsi" /></SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{#each availableFunctions as fn}
								<SelectItem value={fn.id}>{fn.label} — ({fn.description})</SelectItem>
							{/each}
						</SelectGroup>
					</SelectContent>
				</Select>
			{/if}
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5">
				<Label for={`${idSuffix}-lower-bound`} class="text-xs">Batas Bawah (a)</Label>
				<Input id={`${idSuffix}-lower-bound`} type="number" step="any" bind:value={lowerBound} />
			</div>
			<div class="space-y-1.5">
				<Label for={`${idSuffix}-upper-bound`} class="text-xs">Batas Atas (b)</Label>
				<Input id={`${idSuffix}-upper-bound`} type="number" step="any" bind:value={upperBound} />
			</div>
		</div>

		<div class="space-y-1.5">
			<div class="flex justify-between items-center gap-2">
				<Label for={`${idSuffix}-subintervals`} class="text-xs">Jumlah Subinterval (n)</Label>
				{#if method === 'simpson13'}
					<Badge variant="outline" class="text-[10px] px-1 py-0">Harus Genap</Badge>
				{:else if method === 'simpson38'}
					<Badge variant="outline" class="text-[10px] px-1 py-0">Kelipatan 3</Badge>
				{/if}
			</div>
			<Input
				id={`${idSuffix}-subintervals`}
				type="number"
				min={method === 'simpson13' ? 2 : method === 'simpson38' ? 3 : 1}
				step={method === 'simpson13' ? 2 : method === 'simpson38' ? 3 : 1}
				bind:value={subintervals}
			/>
		</div>

		<div class="bg-muted/40 p-3 rounded-md text-xs space-y-1 text-muted-foreground border">
			<div class="flex justify-between"><span>Ukuran Langkah (h):</span><span class="font-mono font-medium">{result?.h.toFixed(6) ?? '—'}</span></div>
			<div class="flex justify-between"><span>Subinterval Valid (n):</span><span class="font-mono font-medium">{result?.n ?? '—'}</span></div>
		</div>
	</div>
{/snippet}

{#snippet resultsPanel()}
	<div class="space-y-4 text-sm">
		{#if calculationError}
			<div class="rounded-md border border-destructive p-3 text-sm text-destructive" role="alert">{calculationError}</div>
		{/if}
		{#if result}
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
				<span class="text-xs text-muted-foreground font-semibold block mb-1">{result.referenceKind === 'analytic' ? 'Nilai Eksak Analitik' : `Estimasi Referensi Numerik (${result.referenceMethod})`}</span>
				<div class="py-1"><MathRender latex={referenceLatex} displayMode={false} /></div>
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
						<tr><th class="p-2 font-medium">#</th><th class="p-2 font-medium">Subinterval [x_a, x_b]</th><th class="p-2 font-medium">f(x_a)</th><th class="p-2 font-medium">Titik tengah / interior</th><th class="p-2 font-medium">f(x_b)</th><th class="p-2 font-medium text-right">Kontribusi</th></tr>
					</thead>
					<tbody class="divide-y">
						{#each result.stepDetails as step}
							<tr class="hover:bg-muted/50 font-mono"><td class="p-2">{step.index + 1}</td><td class="p-2">[{step.a.toFixed(4)}, {step.b.toFixed(4)}]</td><td class="p-2">{step.yA.toFixed(4)}</td><td class="p-2">{step.xMid !== undefined ? `m=${step.xMid.toFixed(4)}, f(m)=${step.yMid?.toFixed(4)}` : (step.interiorPoints ?? []).map((point) => `(${point.x.toFixed(4)}: ${point.weight}×${point.y.toFixed(4)})`).join(', ') || '—'}</td><td class="p-2">{step.yB.toFixed(4)}</td><td class="p-2 text-right font-semibold">{step.contribution.toFixed(6)}</td></tr>
						{/each}
					</tbody>
				</table>
			</ScrollArea>
		</div>
		{/if}
	</div>
{/snippet}

<div class="my-6 space-y-2">
	<h3 class="text-lg font-semibold tracking-tight">Kalkulator Integrasi Interaktif</h3>
	<p class="text-sm text-muted-foreground">Ubah batas integrasi, fungsi, dan jumlah subinterval untuk melihat hasil perhitungan matematis langkah demi langkah secara real-time.</p>

	<!-- Desktop: resizable two-column calculator -->
	<Card class="hidden md:block border shadow-sm overflow-hidden">
		<ResizablePaneGroup direction="horizontal" class="min-h-105 w-full rounded-lg border">
			<ResizablePane defaultSize={35} minSize={25} maxSize={50} class="p-4 bg-card border-r">
				{@render inputFields('desktop')}
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
		<div class="p-4 bg-card">{@render inputFields('mobile')}</div>
		<div class="border-t p-4 bg-muted/20">
			<div class="font-semibold text-sm border-b pb-2 mb-4">Hasil Perhitungan Langkah demi Langkah</div>
			{@render resultsPanel()}
		</div>
	</Card>
</div>
