<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { navItems, selectedNavTab } from "$lib/store.svelte";

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="container mx-auto p-5">
	<div role="tablist" class="tabs tabs-box w-fit mx-auto mb-10">
		{#each navItems as navItem}
			<button
				class="tab {selectedNavTab.value == navItem.value
					? 'tab-active'
					: ''}"
				onclick={() => (selectedNavTab.value = navItem.value)}
			>
				{navItem.label}
			</button>
		{/each}
	</div>

	{@render children()}
</div>
