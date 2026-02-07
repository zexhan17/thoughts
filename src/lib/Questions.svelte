<script lang="ts">
    import { onMount } from "svelte";
    import type { IQuestion } from "./types";

    let questions: IQuestion[] = $state([]);
    let text: string = $state("");
    let editingQuestionId: number | null = $state(null);
    let searchedText: string = $state("");
    let filteredQuestions = $derived(filterQuestions(searchedText));

    function filterQuestions(query: string) {
        if (!query || !query.trim()) return questions;

        const lower = query.toLowerCase();
        return questions.filter((a) => a.text.toLowerCase().includes(lower));
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
        // Load questions from local storage or an API
        const savedQuestions = localStorage.getItem("questions");
        if (savedQuestions) {
            questions = JSON.parse(savedQuestions);
        }
    });

    function handleSave() {
        if (!text) return;
        const newQuestion: IQuestion = {
            id: Date.now(),
            text,
            createdAt: new Date(),
        };
        questions = [...questions, newQuestion];
        localStorage.setItem("questions", JSON.stringify(questions));
        text = "";
    }

    function handleDelete(id: number) {
        if (confirm("Are you sure you want to delete this question?")) {
            questions = questions.filter((question) => question.id !== id);
            localStorage.setItem("questions", JSON.stringify(questions));
            questions = questions.filter((question) => question.id !== id);
            localStorage.setItem("questions", JSON.stringify(questions));
        }
    }

    function handleEdit(id: number) {
        const question = questions.find((q) => q.id === id);
        if (question) {
            text = question.text;
            editingQuestionId = id;
        }
    }
</script>

<div class="space-y-5">
    <div class="space-y-2">
        <textarea
            bind:value={text}
            class="textarea h-24 w-full"
            placeholder="Question"
            onkeydown={(e) => {
                if (e.key == "Enter") {
                    handleSave();
                }
            }}
        ></textarea>
        <button
            class="btn btn-primary"
            onclick={() => {
                if (editingQuestionId) {
                    // Update existing question
                    questions = questions.map((question) =>
                        question.id === editingQuestionId
                            ? { ...question, text }
                            : question,
                    );
                    editingQuestionId = null;
                    localStorage.setItem(
                        "questions",
                        JSON.stringify(questions),
                    );
                    text = "";
                } else {
                    // Save new question
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
        placeholder="Search questions..."
        class="input w-full"
        bind:value={searchedText}
    />

    <div class="space-y-2">
        {#each filteredQuestions as question (question.id)}
            <div class="card bg-base-300 shadow-md">
                <div class="card-body">
                    <p>
                        {#each highlightParts(question.text, searchedText) as part, i (i)}
                            {#if part.match}
                                <span
                                    class="bg-yellow-200 px-1 rounded text-black"
                                >
                                    {part.text}
                                </span>
                            {:else}
                                {part.text}
                            {/if}
                        {/each}
                    </p>
                    <!-- date, edit, delete -->
                    <div class="flex justify-between items-center">
                        <p class="text-xs text-gray-500">
                            {new Date(question.createdAt).toDateString()}
                            -
                            {new Date(question.createdAt).toLocaleTimeString()}
                        </p>

                        <div class="flex gap-2">
                            <button
                                class="btn btn-sm"
                                onclick={() => handleEdit(question.id)}
                            >
                                Edit
                            </button>
                            <button
                                class="btn btn-sm btn-error"
                                onclick={() => handleDelete(question.id)}
                            >
                                X
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
