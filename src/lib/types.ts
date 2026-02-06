export enum Tabs {
    Thoughts = 'thoughts',
    Questions = 'questions',
    Answers = 'answers',
}

export interface IAnswer {
    id: number;
    text: string;
    createdAt: Date;
    questionId: number;
}

export interface IQuestion {
    id: number;
    text: string;
    createdAt: Date;
}

export interface IThought {
    id: number;
    text: string;
    createdAt: Date;
}