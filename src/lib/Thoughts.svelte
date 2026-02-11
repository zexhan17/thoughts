<script lang="ts">
    import { onMount } from "svelte";
    import type { IThought } from "./types";

    let thoughts: IThought[] = $state([]);
    let text: string = $state("");
    let editingThoughtId: number | null = $state(null);
    let searchedText: string = $state("");
    let filteredThoughts = $derived(filterThoughts(searchedText));

    function filterThoughts(query: string) {
        if (!query || !query.trim()) return thoughts;

        const lower = query.toLowerCase();
        return thoughts.filter((a) => a.text.toLowerCase().includes(lower));
    }

    type Part = { text: string; match: boolean };

    function highlightParts(text: string, query: string): Part[] {
        if (!query || !query.trim()) return [{ text, match: false }];

        const escapedQuery = query.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
        const re = new RegExp(escapedQuery, "gi");
        let lastIndex = 0;
        const parts: Part[] = [];
        let match: RegExpExecArray | null;

        while ((match = re.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    text: text.slice(lastIndex, match.index),
                    match: false,
                });
            }
            parts.push({ text: match[0], match: true });
            lastIndex = re.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push({ text: text.slice(lastIndex), match: false });
        }

        return parts;
    }

    onMount(() => {
        // Load thoughts from local storage or an API
        const savedThoughts = localStorage.getItem("thoughts");
        if (savedThoughts) {
            thoughts = JSON.parse(savedThoughts);
        }
    });

    function handleSave() {
        if (!text) return;
        const newThought: IThought = {
            id: Date.now(),
            text,
            createdAt: new Date(),
        };
        thoughts = [...thoughts, newThought];
        localStorage.setItem("thoughts", JSON.stringify(thoughts));
        text = "";
    }

    function handleDelete(id: number) {
        if (confirm("Are you sure you want to delete this thought?")) {
            thoughts = thoughts.filter((thought) => thought.id !== id);
            localStorage.setItem("thoughts", JSON.stringify(thoughts));
        }
    }

    function handleEdit(id: number) {
        const thought = thoughts.find((t) => t.id === id);
        if (thought) {
            text = thought.text;
            editingThoughtId = id;
        }
    }
</script>

<div class="space-y-5">
    <div class="space-y-2">
        <textarea
            bind:value={text}
            class="textarea h-24 w-full"
            placeholder="Thought"
        ></textarea>
        <button
            class="btn btn-primary"
            onclick={() => {
                if (editingThoughtId) {
                    // Update existing thought
                    thoughts = thoughts.map((thought) =>
                        thought.id === editingThoughtId
                            ? { ...thought, text }
                            : thought,
                    );
                    editingThoughtId = null;
                    localStorage.setItem("thoughts", JSON.stringify(thoughts));
                    text = "";
                } else {
                    // Save new thought
                    handleSave();
                }
            }}
            disabled={!text}
        >
            Save
        </button>
    </div>

    <input
        type="search"
        placeholder="Search thoughts..."
        class="input w-full"
        bind:value={searchedText}
    />

    <div class="space-y-2">
        {#each filteredThoughts as thought (thought.id)}
            <div class="card bg-base-300 shadow-md">
                <div class="card-body">
                    <p>
                        {#each highlightParts(thought.text, searchedText) as part, i (i)}
                            {#if part.match}
                                <span
                                    class="bg-yellow-200 px-1 rounded text-black"
                                    >{part.text}</span
                                >
                            {:else}
                                {part.text}
                            {/if}
                        {/each}
                    </p>
                    <!-- date, edit, delete -->
                    <div class="flex justify-between items-center">
                        <p class="text-xs text-gray-500">
                            {new Date(thought.createdAt).toDateString()}
                            -
                            {new Date(thought.createdAt).toLocaleTimeString()}
                        </p>

                        <div class="flex gap-2">
                            <button
                                class="btn btn-sm"
                                onclick={() => handleEdit(thought.id)}
                                >Edit</button
                            >
                            <button
                                class="btn btn-sm btn-error"
                                onclick={() => handleDelete(thought.id)}
                                >X</button
                            >
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
