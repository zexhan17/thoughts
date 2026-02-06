<script lang="ts">
    import { onMount } from "svelte";
    import type { IAnswer, IQuestion } from "./types";

    let questions: IQuestion[] = $state([]);
    let answers: IAnswer[] = $state([]);
    let text: string = $state("");
    let editingAnswerId: number | null = $state(null);
    let selectedQuestionId: number | null = $state(null);

    onMount(() => {
        // Load questions from local storage
        const savedQuestions = localStorage.getItem("questions");
        if (savedQuestions) {
            questions = JSON.parse(savedQuestions);
        }
        // Load answers from local storage
        const savedAnswers = localStorage.getItem("answers");
        if (savedAnswers) {
            answers = JSON.parse(savedAnswers);
        }
    });

    function handleSave() {
        if (!text) return;
        const newAnswer: IAnswer = {
            id: Date.now(),
            text,
            createdAt: new Date(),
            questionId: selectedQuestionId!,
        };
        answers = [...answers, newAnswer];
        localStorage.setItem("answers", JSON.stringify(answers));
        text = "";
    }

    function handleDelete(id: number) {
        answers = answers.filter((answer) => answer.id !== id);
        localStorage.setItem("answers", JSON.stringify(answers));
    }

    function handleEdit(id: number) {
        const answer = answers.find((a) => a.id === id);
        if (answer) {
            text = answer.text;
            editingAnswerId = id;
        }
    }
</script>

Answers
<div class="space-y-2">
    <select class="select" bind:value={selectedQuestionId}>
        <option disabled selected>Pick a question</option>
        {#each questions as question}
            <option
                value={question.id}
                selected={question.id === selectedQuestionId}
                >{question.text}</option
            >
        {/each}
    </select>

    <textarea
        bind:value={text}
        class="textarea h-24 w-full"
        placeholder="Answer"
        onkeydown={(e) => {
            if (e.key == "Enter") {
                handleSave();
            }
        }}
    ></textarea>
    <button
        class="btn btn-primary"
        onclick={() => {
            if (editingAnswerId) {
                // Update existing answer
                answers = answers.map((answer) =>
                    answer.id === editingAnswerId
                        ? { ...answer, text }
                        : answer,
                );
                editingAnswerId = null;
                localStorage.setItem("answers", JSON.stringify(answers));
                text = "";
            } else {
                // Save new answer
                handleSave();
            }
        }}
        disabled={!text}
    >
        Save
    </button>
</div>

<div class="space-y-2 mt-10">
    {#each answers as answer (answer.id)}
        <div class="card bg-base-300 shadow-md">
            <div class="card-body">
                <p>{answer.text}</p>
                <!-- date, edit, delete -->
                <div class="flex justify-between items-center">
                    <p class="text-xs text-gray-500">
                        {new Date(answer.createdAt).toLocaleString()}
                    </p>

                    <div class="flex gap-2">
                        <button
                            class="btn btn-sm"
                            onclick={() => handleEdit(answer.id)}>Edit</button
                        >
                        <button
                            class="btn btn-sm btn-error"
                            onclick={() => handleDelete(answer.id)}>X</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>
