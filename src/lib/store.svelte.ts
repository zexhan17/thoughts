import { Tabs } from "./types";

export const navItems = [
    { label: 'Thoughts', value: Tabs.Thoughts },
    { label: 'Questions', value: Tabs.Questions },
    { label: 'Answers', value: Tabs.Answers },
]

export let selectedNavTab: { value: string } = $state({ value: Tabs.Thoughts });