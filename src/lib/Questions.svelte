<script lang="ts">
    import { onMount } from "svelte";
    import type { IQuestion } from "./types";

    let questions: IQuestion[] = $state([]);
    let text: string = $state("");
    let editingQuestionId: number | null = $state(null);

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
        questions = questions.filter((question) => question.id !== id);
        localStorage.setItem("questions", JSON.stringify(questions));
    }

    function handleEdit(id: number) {
        const question = questions.find((q) => q.id === id);
        if (question) {
            text = question.text;
            editingQuestionId = id;
        }
    }
</script>

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
                localStorage.setItem("questions", JSON.stringify(questions));
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

<div class="space-y-2 mt-10">
    {#each questions as question (question.id)}
        <div class="card bg-base-300 shadow-md">
            <div class="card-body">
                <p>{question.text}</p>
                <!-- date, edit, delete -->
                <div class="flex justify-between items-center">
                    <p class="text-xs text-gray-500">
                        {new Date(question.createdAt).toLocaleString()}
                    </p>

                    <div class="flex gap-2">
                        <button
                            class="btn btn-sm"
                            onclick={() => handleEdit(question.id)}>Edit</button
                        >
                        <button
                            class="btn btn-sm btn-error"
                            onclick={() => handleDelete(question.id)}>X</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>
