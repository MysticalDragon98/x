import { PromptModel } from "../enums/PromptModel.enum";

export class Mindset {
    public model: PromptModel;
    public intent: string;
    public schema?: any;
    public reasoning?: "minimal" | "low" | "medium" | "high";

    constructor ({ model, intent, schema, reasoning }: {
        model: PromptModel,
        intent: string,
        schema?: any,
        reasoning?: "minimal" | "low" | "medium" | "high"
    }) {
        this.model = model;
        this.intent = intent;
        this.schema = schema;
        this.reasoning = reasoning;
    }
}