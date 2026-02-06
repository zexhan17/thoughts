<script lang="ts">
    import Answers from "$lib/Answers.svelte";
    import Questions from "$lib/Questions.svelte";
    import { selectedNavTab } from "$lib/store.svelte";
    import Thoughts from "$lib/Thoughts.svelte";
    import { Tabs } from "$lib/types";
</script>

{#if selectedNavTab.value == Tabs.Thoughts}
    <Thoughts />
{:else if selectedNavTab.value == Tabs.Answers}
    <Answers />
{:else if selectedNavTab.value == Tabs.Questions}
    <Questions />
{/if}
