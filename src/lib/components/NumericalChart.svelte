<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		Filler,
		type ChartData,
		type ChartOptions,
	} from 'chart.js';
	import type { MethodType, FunctionType } from '$lib/types';
	import {
		getFunction,
		generateTrapezoidPoints,
		generateSimpson13Points,
		generateSimpson38Points,
		generateMidpointPoints,
	} from '$lib/mathUtils';
	import { Card, CardContent } from '$lib/components/ui/card';

	// Register Chart.js modules
	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		Filler
	);

	interface Props {
		method: MethodType;
		selectedFunction: FunctionType;
		a: number;
		b: number;
		n: number;
	}

	let { method, selectedFunction, a, b, n }: Props = $props();

	const fn = $derived(getFunction(selectedFunction));

	// Compute datasets dynamically based on current selected method
	const chartData = $derived.by<ChartData<'line'>>(() => {
		if (method === 'midpoint') {
			const { smooth, fillPoints } = generateMidpointPoints(fn, a, b, n);

			const smoothDataset = {
				label: `f(x) Kurva Eksak`,
				data: smooth.map((p) => ({ x: p.x, y: p.y })),
				borderColor: 'rgb(59, 130, 246)',
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.2,
				fill: false,
			};

			const rectDatasets = fillPoints.map((rect, idx) => ({
				label: idx === 0 ? 'Persegi Panjang Titik Tengah' : '',
				data: [
					{ x: rect.x0, y: 0 },
					{ x: rect.x0, y: rect.y },
					{ x: rect.x1, y: rect.y },
					{ x: rect.x1, y: 0 },
				],
				borderColor: 'rgba(234, 88, 12, 0.8)',
				backgroundColor: 'rgba(234, 88, 12, 0.25)',
				borderWidth: 1.5,
				pointRadius: 2,
				fill: 'origin',
			}));

			return {
				datasets: [smoothDataset, ...rectDatasets],
			};
		} else if (method === 'simpson13') {
			const { smooth, fillPoints } = generateSimpson13Points(fn, a, b, n);

			const smoothDataset = {
				label: `f(x) Kurva Eksak`,
				data: smooth.map((p) => ({ x: p.x, y: p.y })),
				borderColor: 'rgb(59, 130, 246)',
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.2,
				fill: false,
			};

			const approxDataset = {
				label: `Pendekatan Parabola Simpson 1/3`,
				data: fillPoints.map((p) => ({ x: p.x, y: p.y })),
				borderColor: 'rgba(16, 185, 129, 0.9)',
				backgroundColor: 'rgba(16, 185, 129, 0.25)',
				borderWidth: 2,
				pointRadius: 1,
				fill: 'origin',
			};

			return {
				datasets: [smoothDataset, approxDataset],
			};
		} else if (method === 'simpson38') {
			const { smooth, fillPoints } = generateSimpson38Points(fn, a, b, n);

			const smoothDataset = {
				label: `f(x) Kurva Eksak`,
				data: smooth.map((p) => ({ x: p.x, y: p.y })),
				borderColor: 'rgb(59, 130, 246)',
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.2,
				fill: false,
			};

			const approxDataset = {
				label: `Pendekatan Kubik Simpson 3/8`,
				data: fillPoints.map((p) => ({ x: p.x, y: p.y })),
				borderColor: 'rgba(168, 85, 247, 0.9)',
				backgroundColor: 'rgba(168, 85, 247, 0.25)',
				borderWidth: 2,
				pointRadius: 1,
				fill: 'origin',
			};

			return {
				datasets: [smoothDataset, approxDataset],
			};
		} else {
			// Trapezoid rule
			const { smooth, fillPoints } = generateTrapezoidPoints(fn, a, b, n);

			const smoothDataset = {
				label: `f(x) Kurva Eksak`,
				data: smooth.map((p) => ({ x: p.x, y: p.y })),
				borderColor: 'rgb(59, 130, 246)',
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.2,
				fill: false,
			};

			const approxDataset = {
				label: `Pendekatan Linear Trapesium`,
				data: fillPoints.map((p) => ({ x: p.x, y: p.y })),
				borderColor: 'rgba(239, 68, 68, 0.9)',
				backgroundColor: 'rgba(239, 68, 68, 0.25)',
				borderWidth: 2,
				pointRadius: 4,
				pointBackgroundColor: 'rgba(239, 68, 68, 1)',
				fill: 'origin',
			};

			return {
				datasets: [smoothDataset, approxDataset],
			};
		}
	});

	const options: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				type: 'linear',
				title: {
					display: true,
					text: 'x',
				},
				grid: {
					color: 'rgba(156, 163, 175, 0.2)',
				},
			},
			y: {
				type: 'linear',
				title: {
					display: true,
					text: 'f(x)',
				},
				grid: {
					color: 'rgba(156, 163, 175, 0.2)',
				},
			},
		},
		plugins: {
			legend: {
				display: true,
				position: 'top',
				labels: {
					filter: (item) => item.text !== '',
				},
			},
			tooltip: {
				mode: 'index',
				intersect: false,
			},
		},
	};
</script>

<div class="my-6 space-y-2">
	<h3 class="text-lg font-semibold tracking-tight">Visualisasi Grafis</h3>
	<p class="text-sm text-muted-foreground">
		Bentuk geometris interaktif (trapesium, parabola, atau persegi panjang) digambar secara dinamis di bawah kurva fungsi.
	</p>

	<Card class="border shadow-sm">
		<CardContent class="p-4">
			<div class="h-90 w-full">
				<Line data={chartData} {options} />
			</div>
		</CardContent>
	</Card>
</div>
