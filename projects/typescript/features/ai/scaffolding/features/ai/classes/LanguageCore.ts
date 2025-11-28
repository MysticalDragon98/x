import { Agent } from "./Agent";
import { ExecutionPlan } from "./ExecutionPlan";

export class LanguageCore {
    
    static init () {}

    static async process (text: string) {
        const executionPlan = await Agent.matchers.match(text) ?? await ExecutionPlan.fromPrompt(text);

        await executionPlan.execute();
    }
    
}