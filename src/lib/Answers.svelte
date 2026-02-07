<script lang="ts">
    import { onMount } from "svelte";
    import type { IAnswer, IQuestion } from "./types";

    let questions: IQuestion[] = $state([]);
    let answers: IAnswer[] = $state([]);
    let text: string = $state("");
    let searchedText: string = $state("");
    let editingAnswerId: number | null = $state(null);
    let selectedQuestionId: number | null = $state(null);
    let filteredAnswers = $derived(filterAnswers(searchedText));

    function filterAnswers(query: string) {
        if (!query || !query.trim()) return answers;

        const lower = query.toLowerCase();
        return answers.filter((a) => a.text.toLowerCase().includes(lower));
    }

    onMount(() => {
        const savedQuestions = localStorage.getItem("questions");
        if (savedQuestions) {
            try {
                questions = JSON.parse(savedQuestions);
            } catch (e) {}
        }

        const savedAnswers = localStorage.getItem("answers");
        if (savedAnswers) {
            try {
                answers = JSON.parse(savedAnswers);
            } catch (e) {}
        }
    });

    function persistAnswers() {
        localStorage.setItem("answers", JSON.stringify(answers));
    }

    function save() {
        const trimmed = text.trim();
        if (!trimmed) return;

        if (editingAnswerId !== null) {
            if (selectedQuestionId === null) return;
            const qId = Number(selectedQuestionId);
            answers = answers.map((a) =>
                a.id === editingAnswerId
                    ? { ...a, text: trimmed, questionId: qId }
                    : a,
            );
            editingAnswerId = null;
            text = "";
            selectedQuestionId = null;
            persistAnswers();
            return;
        }

        if (selectedQuestionId === null) return;
        const qId = Number(selectedQuestionId);
        const newAnswer: IAnswer = {
            id: Date.now(),
            text: trimmed,
            createdAt: new Date(),
            questionId: qId,
        };
        answers = [...answers, newAnswer];
        persistAnswers();
        text = "";
    }

    function remove(id: number) {
        if (confirm("Are you sure you want to delete this answer?")) {
            answers = answers.filter((a) => a.id !== id);
            persistAnswers();
        }
    }

    function edit(id: number) {
        const a = answers.find((x) => x.id === id);
        if (!a) return;
        text = a.text;
        editingAnswerId = id;
        selectedQuestionId = a.questionId;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            save();
        }
    }
</script>

<div class="space-y-5">
    <div class="space-y-2">
        <select
            id="question-select"
            class="select w-full"
            bind:value={selectedQuestionId}
            onchange={(e) =>
                (selectedQuestionId =
                    Number((e.target as HTMLSelectElement).value) || null)}
        >
            <option disabled selected> Pick a question </option>
            {#if questions.length === 0}
                <option disabled>No questions available</option>
            {/if}
            {#each questions as question}
                <option value={question.id}>{question.text}</option>
            {/each}
        </select>

        <textarea
            bind:value={text}
            class="textarea h-24 w-full"
            placeholder="Answer (press Ctrl/Cmd+Enter to save)"
            onkeydown={handleKeydown}
            aria-label="Answer text"
        ></textarea>

        <div>
            <button
                class="btn btn-primary"
                onclick={save}
                disabled={!text.trim() || selectedQuestionId === null}
            >
                {editingAnswerId !== null ? "Update" : "Save"}
            </button>
        </div>
    </div>

    <input
        type="search"
        placeholder="Search answers..."
        class="input w-full"
        bind:value={searchedText}
    />

    <div class="space-y-2">
        {#if answers.length === 0}
            <p class="text-sm text-gray-500">No answers yet.</p>
        {/if}

        {#each filteredAnswers as answer (answer.id)}
            <div class="card bg-base-300 shadow-md">
                <div class="card-body">
                    <span class="text-sm text-gray-600 mb-1">
                        Question:
                        <p class="font-medium text-base-content">
                            {questions.find((q) => q.id === answer.questionId)
                                ?.text ?? "—"}
                        </p>
                    </span>

                    <span class="text-sm text-gray-600 mb-1">
                        Answer:
                        <p class="font-medium text-base-content">
                            {answer.text}
                        </p>
                    </span>

                    <div class="flex justify-between items-center">
                        <p class="text-xs text-gray-500 mt-2">
                            {new Date(answer.createdAt).toDateString()}
                            -
                            {new Date(answer.createdAt).toLocaleTimeString()}
                        </p>

                        <div
                            class="shrink-0 flex gap-2 items-start md:items-center"
                        >
                            <button
                                class="btn btn-sm"
                                onclick={() => edit(answer.id)}>Edit</button
                            >
                            <button
                                class="btn btn-sm btn-error"
                                onclick={() => remove(answer.id)}
                                aria-label="Delete answer">Delete</button
                            >
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
