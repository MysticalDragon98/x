import { Mindset } from "@/features/openai/classes/mindset";
import { PromptModel } from "@/features/openai/enums/PromptModel.enum";

export const HTTPEndpointTypeInferrerMindset = new Mindset({
    model: PromptModel.Default,
    intent: `You receive a Typescript function.
        Your goal is to create a type that represents the input parameters of the function.
        Also return the type name for the type definition.
        Also, create a metadata array of each function parameters in the following format:
        { name: string, type: string, required: boolean, default?: string }

        Arguments with default values must have required: false
        
        Input: function myNameHTTPEndpoint (a: number, b?: string, c: number = 2): void
        Output:

        type MyNameHTTPEndpointInput = {
            a: number;
            b?: string;
            c?: number;
        };

        const Params = [
            { name: "a", type: "number", required: true },
            { name: "b", type: "string", required: false },
            { name: "c", type: "number", required: true, default: 2 }
        ];
    `,

    schema: {
        type: "object",
        properties: {
            typeName: { type: "string" },
            typeOutput: { type: "string" },
            paramsOutput: { type: "string" }
        },
        required: ["output"]
    }
});