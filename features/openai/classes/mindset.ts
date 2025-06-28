import { PromptModel } from "../enums/PromptModel.enum";

export class Mindset {
    public model: PromptModel;
    public intent: string;
    public schema?: any;

    constructor ({ model, intent, schema }: {
        model: PromptModel,
        intent: string,
        schema?: any
    }) {
        this.model = model;
        this.intent = intent;
        this.schema = schema;
    }
}