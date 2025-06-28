import { Mindset } from "../../../../../../features/openai/classes/mindset";
import { PromptModel } from "../../../../../../features/openai/enums/PromptModel.enum";

export const ZodSchemaGeneratorMindset = new Mindset({
    model: PromptModel.Default,
    intent: `
        You are given a typescript schema, your goal is to generate a zod object based on it. Infer all what you can from the specified type.
        Your output must follow the following pattern:

        import * as z from "zod/v4";

        export const {TypeName}ZodSchema = ....
    `,

    schema: {
        type: "object",
        properties: {
            output: { type: "string" }
        },
        required: ["output"]
    }
})