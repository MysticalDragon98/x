import { $assert, CustomErrors } from "@/features/errors";
import OpenAIFeature from "@/features/openai";
import { Mindset } from "@/features/openai/classes/mindset";
import { PromptModel } from "@/features/openai/enums/PromptModel.enum";

const Errors = CustomErrors({
    NoCommentsFound: "At least one comment is required to compile a tool.",
    InvalidSignature: "The signature of the tool is invalid, it must be of the form: export default function <name> (<parameters>): <return type> {",
    NoExplicitReturnTypeFound: "The tool must explicitly define a return type"  
});

const ArgCompilerMindset = new Mindset({
    model: PromptModel.Default,
    intent: `
        Role: You are a Typescript to JSON schema converter
        Goal: Your goal is to convert typescript type arguments to JSON schema
        Constraints:
            - You must always return an object, even if the type is empty, the base must be { type: "object", properties: {}, required: [] }
            - Take in count the optionality and subtypes, so it matches perfectly and all rules
            - Assume ar non optional parameters are required
        
        Examples:
            Input: "{ name, string }: { name: string, age?: number }"
            Output: { type: "object", properties: { name: { type: "string" }, age: { type: "number", optional: true } }, required: [ "name" ] }
    `,

    schema: {
        type: "object",
        properties: {
            type: {
                type: "string",
                enum: ["object"]
            },

            properties: {
                type: "object",
                additionalProperties: true,
                required: [],
                properties: {}                
            },

            required: {
                type: "array",
                items: {
                    type: "string"
                }
            },

            additionalProperties: {
                type: "boolean",
                value: false
            }
        },
        required: ["type", "properties", "required", "additionalProperties"]
    }
});

export class ToolCompiler {

    constructor () {}

    async compile (name: string, content: string) {
        const _comments = content.match(/^\/\/\s*\?\s*(.+)$/gm)!;
        const _signature = content.match(/^export\s+default\s+(?:async\s+)?function\s+.+?\((.*)\): (.+) {$/m)?.slice(0, 3)!;

        $assert(_comments, Errors.NoCommentsFound);
        $assert(_signature, Errors.InvalidSignature);

        const [ sig, params, returnType ] = _signature.map(x => x.trim());

        $assert(returnType, Errors.NoExplicitReturnTypeFound);

        const comments = JSON.stringify(_comments.map(x => x.trim()).join("\n").replace(/^\/\/\s*\?\s*/g, ""));

        const returnTypeValue = returnType.replace(/Promise<(.*)>/, "$1");
        const parsedArgs = await this.compileArgs(params, sig);

        return [
            `import ${name}Tool from "../tools/${name}.tool";`,
            `export default {`,
            `    name: "${name}",`,
            `    description: ${comments},`,
            `    input: ${JSON.stringify(parsedArgs, null, 4).replace(/^/gm, "    ").substring(4)},`,
            `    output: ${JSON.stringify(returnTypeValue)},`,
            `    execute: ${name}Tool`,
            `}`
        ].join("\n");
    }

    async compileArgs (args: string, code: string) {
        if (args.length === 0) return { type: "object", properties: {} };
        const jsonSchema = await OpenAIFeature.prompt(ArgCompilerMindset, args);

        return jsonSchema;
    }

}