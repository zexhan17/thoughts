<script lang="ts">
    import { onMount } from "svelte";
    import type { IThought } from "./types";

    let thoughts: IThought[] = $state([]);
    let text: string = $state("");
    let editingThoughtId: number | null = $state(null);

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
        thoughts = thoughts.filter((thought) => thought.id !== id);
        localStorage.setItem("thoughts", JSON.stringify(thoughts));
    }

    function handleEdit(id: number) {
        const thought = thoughts.find((t) => t.id === id);
        if (thought) {
            text = thought.text;
            editingThoughtId = id;
        }
    }
</script>

<div class="space-y-2">
    <textarea
        bind:value={text}
        class="textarea h-24 w-full"
        placeholder="Thought"
        onkeydown={(e) => {
            if (e.key == "Enter") {
                handleSave();
            }
        }}
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

<div class="space-y-2 mt-10">
    {#each thoughts as thought (thought.id)}
        <div class="card bg-base-300 shadow-md">
            <div class="card-body">
                <p>{thought.text}</p>
                <!-- date, edit, delete -->
                <div class="flex justify-between items-center">
                    <p class="text-xs text-gray-500">
                        {new Date(thought.createdAt).toLocaleString()}
                    </p>

                    <div class="flex gap-2">
                        <button
                            class="btn btn-sm"
                            onclick={() => handleEdit(thought.id)}>Edit</button
                        >
                        <button
                            class="btn btn-sm btn-error"
                            onclick={() => handleDelete(thought.id)}>X</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>
