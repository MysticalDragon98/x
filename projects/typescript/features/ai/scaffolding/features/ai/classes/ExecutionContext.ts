import OpenAIFeature from "@/features/openai";
import { Mindset } from "@/features/openai/classes/mindset";
import { PromptModel } from "@/features/openai/enums/PromptModel.enum";
import { ExecutionPlan } from "./ExecutionPlan";
import AudioFeature from "@/features/audio";

export class ExecutionContext {

    #variables: any = {};
    plan: ExecutionPlan;

    constructor (plan: ExecutionPlan) {
        this.#variables = {};
        this.plan = plan;
    }

    setVariable (name: string, value: any) {
        this.#variables[name] = value;
    }

    getVariable (name: string) {
        return this.#variables[name];
    }
    
    resolveVariable (name: string) {
        const path = name.split(".");
        let value = this.#variables;
        for (const part of path) {
            if (!value[part]) return;
            value = value[part];
        }

        return value;
    }

    parseString (text: string) {
        return text.replace(/{([^}]+)}/g, (_, name) => {
            return this.resolveVariable(name);
        });
    }

    async reply (text: string) {
        const wav = await OpenAIFeature.tts(await this.normalizeString(text), "Speak like a mexican girl");
        await AudioFeature.play(wav);
    }
    
    async normalizeString (text: string) {
        const variables = text.match(/{([^}]+)}/g)?.map(x => x.substring(1, x.length - 1));

        if (!variables) return text;

        return await OpenAIFeature.prompt(new Mindset({
            model: PromptModel.Mini,
            intent: `
                You are given a text and a list of variables, adapt the text with the variables so it sounds natural and coloquial

                Variables: ${
                    JSON.stringify(variables?.reduce((acc, name) => {
                        return {
                            ...acc,
                            [name]: this.resolveVariable(name)
                        }
                    }, {}), null, 4)
                }
            `
        }), text);
    }

}