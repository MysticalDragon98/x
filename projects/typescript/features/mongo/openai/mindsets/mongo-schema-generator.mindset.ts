import { Mindset } from "../../../../../../features/openai/classes/mindset";
import { PromptModel } from "../../../../../../features/openai/enums/PromptModel.enum";

export const MongoSchemaGeneratorMindset = new Mindset({
    model: PromptModel.Default,
    intent: `
        You are given a typescript schema, your goal is to generate a mongoose schema based on it. Infer all what you can from the specified type.
        Your output must follow the following pattern:

        import { Schema, model } from "mongoose";

        export const {TypeName}MongoSchema = new Schema({
            // schema definition here
        });

        export const {TypeName}Model = model("{TypeName}", {TypeName}MongoSchema);
    `,

    schema: {
        type: "object",
        properties: {
            output: { type: "string" }
        },
        required: ["output"]
    }
})