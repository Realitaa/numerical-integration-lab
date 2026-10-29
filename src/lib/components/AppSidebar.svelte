<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Drawer,
		DrawerContent,
		DrawerDescription,
		DrawerHeader,
		DrawerTitle,
		DrawerTrigger,
	} from '$lib/components/ui/drawer';
	import { CircleQuestionMark } from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import type { MethodType } from '$lib/types';
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

	interface Props {
		selected: MethodType;
		onSelect: (m: MethodType) => void;
	}

	let { selected, onSelect }: Props = $props();

	const methods: { id: MethodType; label: string }[] = [
		{ id: 'trapezoid', label: 'Metode Trapesium' },
		{ id: 'simpson13', label: 'Metode Simpson 1/3' },
		{ id: 'simpson38', label: 'Metode Simpson 3/8' },
		{ id: 'midpoint', label: 'Metode Titik Tengah' },
	];
</script>

<aside class="w-full md:w-64 md:h-screen md:sticky md:top-0 flex flex-col p-4 bg-sidebar border-r border-sidebar-border shrink-0 select-none">
	<!-- Brand/Logo -->
	<div class="px-2 py-4 mb-2">
		<h1 class="text-xl font-bold text-sidebar-foreground">Lab Integrasi Numerik</h1>
		<p class="text-xs text-sidebar-foreground/60 mt-1">Eksplorasi metode integrasi numerik secara interaktif</p>
	</div>

	<!-- Navigation Pills -->
	<div class="px-2 space-y-1">
		<span class="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider block mb-2">Metode</span>
		{#each methods as { id, label }}
			<Button
				variant={selected === id ? 'default' : 'outline'}
				class="w-full justify-start text-sm font-medium"
				onclick={() => onSelect(id)}
			>
				{label}
			</Button>
		{/each}
	</div>

	<!-- About Section -->
	<div class="px-2 mt-6">
		<Separator class="my-3 bg-sidebar-border" />
		<span class="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 block">Bantuan & Informasi</span>
		<Drawer>
			<DrawerTrigger class={buttonVariants({ variant: 'outline', class: 'w-full justify-start' })}>
				<CircleQuestionMark class="mr-2 h-4 w-4" />
				Tentang Aplikasi
			</DrawerTrigger>
			<DrawerContent class="w-full max-w-2xl mx-auto max-h-[85vh]">
				<DrawerHeader class="border-b p-4">
					<DrawerTitle>Lab Integrasi Numerik</DrawerTitle>
					<DrawerDescription>
						Aplikasi web interaktif untuk mempelajari dan menguji metode-metode integrasi numerik.
					</DrawerDescription>
				</DrawerHeader>
				<div class="min-h-0 pl-6 pr-4 pb-6 text-sm leading-relaxed">
					<ScrollArea class="h-[calc(85vh-9rem)] w-full">
						<div class="max-w-2xl mx-auto space-y-4 pr-1 pb-4">
  						<p>
  							Aplikasi ini dirancang untuk membantu memahami empat metode integrasi numerik klasik
  							dalam menghitung pendekatan nilai integral tentu:
  						</p>
  						<ul class="list-disc list-inside space-y-1.5 text-muted-foreground">
  							<li><strong>Metode Trapesium</strong> — Mengaproksimasi luas daerah menggunakan trapesium linear.</li>
  							<li><strong>Metode Simpson 1/3</strong> — Menggunakan kurva parabola kuadratik, membutuhkan jumlah subinterval (n) genap.</li>
  							<li><strong>Metode Simpson 3/8</strong> — Menggunakan kurva kubik, membutuhkan n kelipatan 3.</li>
  							<li><strong>Metode Titik Tengah</strong> — Menggunakan penjumlahan persegi panjang Riemann berbasis titik tengah.</li>
  						</ul>
  						<p>
  							Pilih metode dari sidebar, tentukan batas integrasi dan fungsi, lalu amati langkah-langkah
  							perhitungan matematis secara otomatis beserta visualisasi grafik interaktifnya.
  						</p>
  						<p>
  							Anda juga dapat melihat dan mempelajari implementasi kode program dalam bahasa Python,
  							JavaScript, Java, dan C++.
  						</p>
  						<p>
  							Website ini dibangun oleh kelompok 7 yang mengambil judul <strong>Integrasi Numerik</strong> pada mata kuliah Metode Numerik yang beranggotakan:
  						</p>
  						<ul class="list-disc list-inside space-y-1.5 text-muted-foreground">
  							<li><strong>ANNISA NURUL HAYATI</strong> (4253250069)</li>
  							<li><strong>MARIMAR SITUMEANG</strong> (4252250010)</li>
  							<li><strong>MUTIARA CHALISTA TARIGAN</strong> (4252550009)</li>
  							<li><strong>REZA MULIA PUTRA</strong> (4251250010)</li>
  						</ul>
						</div>
					</ScrollArea>
				</div>
			</DrawerContent>
		</Drawer>
	</div>

	<!-- Theme Switcher (bottom) -->
	<div class="mt-auto px-2 pt-4 pb-2 border-t border-sidebar-border">
		<span class="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider block mb-2">Tema</span>
		<ThemeToggle />
	</div>
</aside>
