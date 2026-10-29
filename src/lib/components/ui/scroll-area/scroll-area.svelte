<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import Scrollbar from "./scroll-area-scrollbar.svelte";

	let {
		ref = $bindable(null),
		class: className,
		type = "hover",
		orientation = "both",
		children,
		...restProps
	}: ScrollAreaPrimitive.RootProps & {
		orientation?: "vertical" | "horizontal" | "both";
	} = $props();
</script>

<ScrollAreaPrimitive.Root
	bind:ref
	{type}
	data-slot="scroll-area"
	class={cn("relative overflow-hidden", className)}
	{...restProps}
>
	<ScrollAreaPrimitive.Viewport
		data-slot="scroll-area-viewport"
		class="size-full rounded-[inherit] outline-none"
	>
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	{#if orientation === "vertical" || orientation === "both"}
		<Scrollbar orientation="vertical" />
	{/if}
	{#if orientation === "horizontal" || orientation === "both"}
		<Scrollbar orientation="horizontal" />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>
