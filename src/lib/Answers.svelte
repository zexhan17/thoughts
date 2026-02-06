<script lang="ts">
    import { onMount } from "svelte";
    import type { IAnswer, IQuestion } from "./types";

    let questions: IQuestion[] = [];
    let answers: IAnswer[] = [];
    let text: string = "";
    let editingAnswerId: number | null = null;
    let selectedQuestionId: number | null = null;

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
            answers = answers.map((a) =>
                a.id === editingAnswerId ? { ...a, text: trimmed } : a,
            );
            editingAnswerId = null;
            text = "";
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
        answers = answers.filter((a) => a.id !== id);
        persistAnswers();
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

<div class="space-y-2">
    <label class="block" for="question-select">Select question</label>
    <select
        id="question-select"
        class="select w-full"
        bind:value={selectedQuestionId}
        on:change={(e) =>
            (selectedQuestionId =
                Number((e.target as HTMLSelectElement).value) || null)}
    >
        <option value="" disabled selected={selectedQuestionId === null}
            >Pick a question</option
        >
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
        on:keydown={handleKeydown}
        aria-label="Answer text"
    ></textarea>

    <div>
        <button
            class="btn btn-primary"
            on:click={save}
            disabled={!text.trim() || selectedQuestionId === null}
        >
            {editingAnswerId !== null ? "Update" : "Save"}
        </button>
    </div>
</div>

<div class="space-y-2 mt-10">
    {#if answers.length === 0}
        <p class="text-sm text-gray-500">No answers yet.</p>
    {/if}

    {#each answers as answer (answer.id)}
        <div class="card bg-base-300 shadow-md">
            <div class="card-body">
                <div class="flex justify-between">
                    <div>
                        <p class="text- text-gray-600">
                            Question: {questions.find(
                                (q) => q.id === answer.questionId,
                            )?.text ?? "—"}
                        </p>
                        <p class="font-medium">{answer.text}</p>
                        <p class="text-xs text-gray-500">
                            {new Date(answer.createdAt).toLocaleString()}
                        </p>
                    </div>

                    <div class="flex gap-2 items-start">
                        <button
                            class="btn btn-sm"
                            on:click={() => edit(answer.id)}>Edit</button
                        >
                        <button
                            class="btn btn-sm btn-error"
                            on:click={() => remove(answer.id)}
                            aria-label="Delete answer">Delete</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>
