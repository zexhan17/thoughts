<script lang="ts">
    import { Tabs } from "$lib/types";
    import Thoughts from "$lib/Thoughts.svelte";
    import Answers from "$lib/Answers.svelte";
    import Questions from "$lib/Questions.svelte";
    import { onMount } from "svelte";

    export const navItems = [
        { label: "Thoughts", value: Tabs.Thoughts },
        { label: "Questions", value: Tabs.Questions },
        { label: "Answers", value: Tabs.Answers },
    ];

    let selectedNavTab = $state(Tabs.Thoughts);

    onMount(() => {
        const savedTab = localStorage.getItem("selectedNavTab");
        if (savedTab) {
            selectedNavTab = savedTab as Tabs;
        }
    });

    $effect(() => {
        localStorage.setItem("selectedNavTab", selectedNavTab);
    });
</script>

<div class="container mx-auto p-5">
    <div role="tablist" class="tabs tabs-box w-fit mx-auto mb-10">
        {#each navItems as navItem}
            <button
                class="tab {selectedNavTab == navItem.value
                    ? 'tab-active'
                    : ''}"
                onclick={() => (selectedNavTab = navItem.value)}
            >
                {navItem.label}
            </button>
        {/each}
    </div>

    {#if selectedNavTab == Tabs.Thoughts}
        <Thoughts />
    {:else if selectedNavTab == Tabs.Answers}
        <Answers />
    {:else if selectedNavTab == Tabs.Questions}
        <Questions />
    {/if}
</div>
