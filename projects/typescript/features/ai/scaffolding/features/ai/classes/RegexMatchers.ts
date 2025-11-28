import { ExecutionPlan } from "./ExecutionPlan";

export class RegexMatchers {

    constructor (public rules: {
        regex: RegExp,
        plan (...matches: string[]): ExecutionPlan | Promise<ExecutionPlan>
    }[]) {}

    async match (text: string) {
        const str = RegexMatchers.sanitize(text);

        for (const rule of this.rules) {
            const matches = str.match(rule.regex);
            
            if (matches) {
                const plan = await rule.plan(text, ...matches);
                if (plan) return plan;
            }
        }
    }

    static sanitize (text: string) {
        return text
            .normalize("NFD")                         // Decompose accented letters into letter + diacritic
            .replace(/[\u0300-\u036f]/g, "")          // Remove diacritic marks (accents)
            .replace(/[^a-zA-Z0-9\s]/g, "")           // Remove all non-alphanumeric and non-space characters (punctuations etc.)
            .trim()
            .toLowerCase();
    }
}