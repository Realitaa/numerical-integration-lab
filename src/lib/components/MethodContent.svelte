<script lang="ts">
	import { Math as MathRender } from 'svelte-math';
	import type { MethodType } from '$lib/types';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		method: MethodType;
	}

	let { method }: Props = $props();

	const contentMap: Record<
		MethodType,
		{
			title: string;
			description: string;
			constraints: string[];
			formulaLatex: string;
			compositeLatex: string;
			basicLatex: string;
			errorLatex: string;
			summary: string;
		}
	> = {
		trapezoid: {
			title: 'Metode Trapesium (Trapezoidal Rule)',
			description:
				'Mengaproksimasi nilai integral tentu dengan membagi daerah di bawah kurva menjadi beberapa trapesium dan menjumlahkan luasnya.',
			constraints: [
				'Jumlah subinterval (n) dapat berupa bilangan bulat positif berapa saja (n ≥ 1).',
				'Fungsi f(x) harus kontinu pada interval [a, b].',
			],
			formulaLatex:
				'\\int_a^b f(x)\\,dx \\approx \\frac{h}{2} \\left[ f(x_0) + 2 \\sum_{i=1}^{n-1} f(x_i) + f(x_n) \\right]',
			compositeLatex: 'h = \\frac{b - a}{n}, \\quad x_i = a + i \\cdot h',
			basicLatex: 'T_1 = \\frac{b-a}{2}\\left[f(a)+f(b)\\right], \\quad n=1',
			errorLatex: 'E_T = -\\frac{(b - a)^3}{12 n^2} f^{(2)}(\\xi) = O(h^2), \\quad \\xi \\in [a, b]',
			summary: 'Rumus single memakai n=1. Aturan trapesium komposit memiliki galat global orde O(h²).',
		},
		simpson13: {
			title: 'Metode Simpson 1/3',
			description:
				'Mengaproksimasi integral menggunakan lengkungan parabola kuadratik pada setiap pasang subinterval untuk akurasi yang lebih tinggi.',
			constraints: [
				'Jumlah subinterval (n) HARUS berupa bilangan genap (n = 2, 4, 6, ...).',
				'Fungsi f(x) harus memiliki turunan keempat yang kontinu.',
			],
			formulaLatex:
				'\\int_a^b f(x)\\,dx \\approx \\frac{h}{3} \\left[ f(x_0) + 4\\sum_{i\\text{ ganjil}} f(x_i) + 2\\sum_{i\\text{ genap}} f(x_i) + f(x_n) \\right]',
			compositeLatex: 'h = \\frac{b - a}{n}, \\quad n \\text{ harus genap}',
			basicLatex: 'S_2 = \\frac{h}{3}\\left[f(x_0)+4f(x_1)+f(x_2)\\right], \\quad n=2',
			errorLatex: 'E_S = -\\frac{(b - a)^5}{180 n^4} f^{(4)}(\\xi), \\quad \\xi \\in [a, b]',
			summary: 'Aturan dasar memakai n=2; aturan komposit memerlukan n genap. Eksak untuk polinomial berderajat hingga 3.',
		},
		simpson38: {
			title: 'Metode Simpson 3/8',
			description:
				'Mengaproksimasi nilai integral dengan polinomial kubik (derajat 3) yang menghubungkan empat titik pada tiga subinterval.',
			constraints: [
				'Jumlah subinterval (n) HARUS merupakan kelipatan 3 (n = 3, 6, 9, ...).',
				'Fungsi f(x) harus memiliki turunan keempat yang kontinu.',
			],
			formulaLatex:
				'\\int_a^b f(x)\\,dx \\approx \\frac{3h}{8} \\left[ f(x_0) + 3\\sum_{i\\not\\equiv 0 \\pmod 3} f(x_i) + 2\\sum_{i\\equiv 0 \\pmod 3} f(x_i) + f(x_n) \\right]',
			compositeLatex: 'h = \\frac{b - a}{n}, \\quad n \\text{ harus kelipatan 3}',
			basicLatex: 'S_{3/8} = \\frac{3h}{8}\\left[f(x_0)+3f(x_1)+3f(x_2)+f(x_3)\\right], \\quad n=3',
			errorLatex: 'E_{S3/8} = -\\frac{(b - a)^5}{80 n^4} f^{(4)}(\\xi), \\quad \\xi \\in [a, b]',
			summary: 'Aturan dasar memakai n=3; aturan komposit memerlukan n kelipatan 3. Eksak untuk polinomial berderajat hingga 3.',
		},
		midpoint: {
			title: 'Metode Titik Tengah (Midpoint Rule)',
			description:
				'Mengaproksimasi nilai integral dengan menjumlahkan luas persegi panjang yang tingginya dihitung dari nilai fungsi di titik tengah setiap subinterval.',
			constraints: [
				'Jumlah subinterval (n) dapat berupa bilangan bulat positif berapa saja (n ≥ 1).',
				'Fungsi f(x) harus kontinu pada interval [a, b].',
			],
			formulaLatex:
				'M_n = \\Delta x \\sum_{i=1}^{n} f(m_i), \\quad m_i = a + \\left(i-\\frac{1}{2}\\right)\\Delta x',
			compositeLatex: '\\Delta x = \\frac{b - a}{n}, \\quad m_i = a + \\left(i-\\frac{1}{2}\\right)\\Delta x',
			basicLatex: 'M_n = \\sum_{i=1}^{n} f(m_i)\\Delta x',
			errorLatex: 'E_M = \\frac{(b - a)^3}{24 n^2} f\'\'(\\xi), \\quad \\text{dimana } \\xi \\in [a, b]',
			summary:
				'Jumlah Riemann persegi panjang titik tengah umumnya memberikan galat dua kali lebih kecil dibanding aturan trapesium untuk ukuran langkah yang sama.',
		},
	};

	const detail = $derived(contentMap[method]);
</script>

<div class="space-y-4 my-4">
	<Card class="border shadow-sm">
		<CardHeader>
			<div class="flex items-center justify-between">
				<CardTitle class="text-2xl font-bold">{detail.title}</CardTitle>
				<Badge variant={method === 'simpson13' || method === 'simpson38' ? 'destructive' : 'secondary'}>
					{method === 'simpson13'
						? 'n Harus Genap'
						: method === 'simpson38'
							? 'n Kelipatan 3'
							: 'Umum (n ≥ 1)'}
				</Badge>
			</div>
			<CardDescription class="text-base text-muted-foreground mt-1">
				{detail.description}
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<!-- Constraints -->
			<div>
				<h4 class="text-sm font-semibold mb-2">Syarat & Ketentuan:</h4>
				<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
					{#each detail.constraints as constraint}
						<li>{constraint}</li>
					{/each}
				</ul>
			</div>

			<!-- Formulas -->
			<div class="bg-muted/40 p-4 rounded-lg space-y-3 border">
				<div>
					<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
						Rumus Dasar & Komposit
					</span>
					<div class="overflow-x-auto py-2">
						<MathRender latex={detail.basicLatex} displayMode={false} />
						<MathRender latex={detail.formulaLatex} displayMode={true} />
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3">
					<div>
						<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
							Ukuran Langkah & Titik Node
						</span>
						<div class="overflow-x-auto py-1 text-sm">
							<MathRender latex={detail.compositeLatex} displayMode={false} />
						</div>
					</div>
					<div>
						<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
							Galat Pemotongan (Truncation Error)
						</span>
						<div class="overflow-x-auto py-1 text-sm">
							<MathRender latex={detail.errorLatex} displayMode={false} />
						</div>
					</div>
				</div>
			</div>

			<!-- Summary -->
			<p class="text-sm text-muted-foreground italic">
				{detail.summary}
			</p>
		</CardContent>
	</Card>
</div>
