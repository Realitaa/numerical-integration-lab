<script lang="ts">
	import './app.css';
	import { useUrlSearchParams } from '@ariefsn/svelte-use';
	import type { MethodType, ComputationResult } from '$lib/types';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import MethodContent from '$lib/components/MethodContent.svelte';
	import CodeTabs from '$lib/components/CodeTabs.svelte';
	import NumericalCalculator from '$lib/components/NumericalCalculator.svelte';
	import NumericalChart from '$lib/components/NumericalChart.svelte';
	import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { Menu, ArrowUp } from '@lucide/svelte';

	// Setup reactive URL search params
	const urlParams = useUrlSearchParams('history', {
		initial: { method: 'trapezoid' },
	});

	// Valid method helper
	const validMethods: MethodType[] = ['trapezoid', 'simpson13', 'simpson38', 'midpoint'];

	// Derived current method from query params with fallback
	const currentMethod = $derived.by<MethodType>(() => {
		const raw = urlParams.get('method');
		const methodStr = Array.isArray(raw) ? raw[0] : raw;
		if (methodStr && validMethods.includes(methodStr as MethodType)) {
			return methodStr as MethodType;
		}
		return 'trapezoid';
	});

	// Mobile drawer state & main scroll tracking
	let isMobileMenuOpen = $state(false);
	let mainElement = $state<HTMLElement | null>(null);
	let scrollTop = $state(0);

	// Change method handler: updates URL search params reactively, scrolls to top, and closes mobile sidebar
	function handleSelectMethod(m: MethodType) {
		urlParams.set('method', m);
		scrollToTop();
		isMobileMenuOpen = false;
	}

	function handleScroll() {
		if (mainElement) {
			scrollTop = mainElement.scrollTop;
		}
	}

	function scrollToTop() {
		if (mainElement) {
			mainElement.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	// Reactive calculation result state from the calculator
	let calcResult = $state<ComputationResult>({
		method: 'trapezoid',
		function: { id: 'x^2', label: 'x²', description: 'f(x) = x^2' },
		a: 0,
		b: 2,
		n: 4,
		h: 0.5,
		exact: 2.6666666666666665,
		approximation: 2.75,
		error: 0.08333333333333348,
		relativeError: 0.03125,
		stepDetails: [],
		needsEvenN: false,
	});

	function handleResultChange(res: ComputationResult) {
		calcResult = res;
	}
</script>

<div class="flex h-screen w-screen overflow-hidden bg-background text-foreground relative">
	<!-- Desktop Sidebar (Hidden on mobile) -->
	<div class="hidden md:block h-screen">
		<AppSidebar selected={currentMethod} onSelect={handleSelectMethod} />
	</div>

	<!-- Mobile Sidebar Drawer Overlay -->
	<Drawer bind:open={isMobileMenuOpen}>
		<DrawerContent class="w-full max-w-none p-0 border-t">
			<DrawerHeader class="shrink-0 border-b px-4 pb-4">
				<DrawerTitle class="text-left text-base">Menu Navigasi Lab</DrawerTitle>
			</DrawerHeader>
			<div class="w-full min-h-0 flex-1 overflow-y-auto">
				<AppSidebar selected={currentMethod} onSelect={handleSelectMethod} />
			</div>
		</DrawerContent>
	</Drawer>

	<!-- Main Content Area (Independent scroll container) -->
	<main
		bind:this={mainElement}
		onscroll={handleScroll}
		class="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-6"
	>
		<div class="max-w-5xl mx-auto space-y-6 pb-24 md:pb-12">
			<!-- Theory & Concept Header (A) -->
			<MethodContent method={currentMethod} />

			<!-- Multi-Language Code Implementation Tabs (B) -->
			<CodeTabs method={currentMethod} />

			<!-- Interactive Calculator (C) -->
			<NumericalCalculator
				method={currentMethod}
				onResultChange={handleResultChange}
			/>

			<!-- Graphical Visualization (D) -->
			<NumericalChart
				method={currentMethod}
				selectedFunction={calcResult.function.id}
				a={calcResult.a}
				b={calcResult.b}
				n={calcResult.n}
			/>
		</div>
	</main>

	<!-- Mobile Bottom Navigation Bar -->
	<div class="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
		<div class="bg-card/90 backdrop-blur-md border border-border/80 shadow-lg rounded-full px-4 py-2 flex items-center justify-center gap-2">
			<!-- Menu Button (Always centered when alone) -->
			<Button
				variant="ghost"
				size="sm"
				class="rounded-full gap-2 text-xs font-semibold px-4 h-9"
				onclick={() => (isMobileMenuOpen = true)}
			>
				<Menu class="h-4 w-4" />
				<span>Menu</span>
			</Button>

			<!-- Scroll to Top Button (Reactively appears when scrolled down) -->
			{#if scrollTop > 50}
				<div class="h-4 w-px bg-border my-auto"></div>
				<Button
					variant="ghost"
					size="sm"
					class="rounded-full gap-2 text-xs font-semibold px-4 h-9 text-muted-foreground hover:text-foreground transition-all duration-200"
					onclick={scrollToTop}
				>
					<ArrowUp class="h-4 w-4" />
					<span>Keatas</span>
				</Button>
			{/if}
		</div>
	</div>
</div>
