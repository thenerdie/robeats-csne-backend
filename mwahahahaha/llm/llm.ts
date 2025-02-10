import OpenAI from "openai";

export function user(prompt: string) {
    return {
        role: "user",
        content: prompt,
    } as const;
}

export function system(prompt: string) {
    return {
        role: "system",
        content: prompt,
    } as const;
}

export function assistant(prompt: string) {
    return {
        role: "assistant",
        content: prompt,
    } as const;
}

export class Memory {
    history: Array<{ role: string; content: string }>;

    constructor() {
        this.history = [];
    }

    add(role: string, content: string): void {
        this.history.push({ role, content });
    }

    get(): Array<{ role: string; content: string }> {
        return this.history;
    }
}

export class LLM {
    openai: OpenAI;
    system: string;
    memory: Memory;

    constructor(system: string) {
        this.system = system;
        this.memory = new Memory();

        this.openai = new OpenAI({
            baseURL: "https://api.deepseek.com",
            apiKey: process.env.DEEPSEEK_API_KEY,
        });
    }

    async invoke(prompt: string, forget: boolean = false): Promise<string | null> {
        const response = await this.openai.chat.completions
            .create({
                messages: [...(this.memory.get() as any), system(this.system), user(prompt)],
                model: "deepseek-chat",
            })
            .then((completion) => {
                const choice = completion.choices[0];
                const messageContent = choice.message.content;

                return messageContent;
            })
            .catch((error) => {
                throw error;
            });

        if (!forget) {
            this.memory.add("user", prompt);
            this.memory.add("assistant", response!);
        }

        return response;
    }
}
