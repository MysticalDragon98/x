import { Mindset } from "@/features/openai/classes/mindset";
import { PromptModel } from "@/features/openai/enums/PromptModel.enum";
import { Agent } from "./Agent";
import { Schema } from "@/features/schemas/fn/Schema";
import { ArraySchema } from "@/features/schemas/fn/ArraySchema";
import { StringSchema } from "@/features/schemas/fn/StringSchema";
import { AnySchema } from "@/features/schemas/fn/AnySchema";
import { ExecutionPlanStep } from "./ExecutionPlanStep";
import OpenAIFeature from "@/features/openai";
import { ExecutionContext } from "./ExecutionContext";
import { Subject } from "rxjs";
import { ExecutionPlanEvent } from "../types/ExecutionPlanEvent.type";
import { randomUUID } from "crypto";

export class ExecutionPlan {

    static $events: Subject<ExecutionPlanEvent> = new Subject();
    public id: string = randomUUID();
    
    constructor (public input: string, public steps: ExecutionPlanStep[]) {}

    async execute () {
        const ctx = new ExecutionContext(this);
        ExecutionPlan.$events.next({ type: "start", plan: this, timestamp: Date.now() });

        for (const step of this.steps) {
            ExecutionPlan.$events.next({ type: "step:start", plan: this, step, timestamp: Date.now() });
            await step.execute(ctx);
            ExecutionPlan.$events.next({ type: "step:end", plan: this, step, timestamp: Date.now() });
        }

        ExecutionPlan.$events.next({ type: "end", plan: this, timestamp: Date.now() });
    }

    static async fromPrompt (prompt: string) {
        ExecutionPlan.$events.next({ type: "create:start", input: prompt, timestamp: Date.now() });
        
        const mindset = new Mindset({
            model: PromptModel.Default,
            intent: `
                Role: You are a DSL generator
                Task: Generate a DSL given the user request and the list of available actions
                Context:
                    - You are an assistant called ${Agent.name}
                    - You are a local assistant that lives in the user's computer
                    - All your outputs will be executed as actions for the user in the given secuence
                Constraints:
                    - Do not make suggestions or follow ups of any kind
                    - Use ONLY actions in the provided list
                    - IF the question is not related to any action, just return an empty list
                    - All actions are written in form of {module}.{action} and they are defined that way in the provided list
                    - Do NOT try to execute any unnecessary action
                DSL Rules:
                    - You are building an execution plan, so in order to tie dependencies between actions, you will need to provide the "as" field
                    - The "as" field is optional, but if you provide it, the output of the action will store the "as" value for future reference
                    - If you do not provide the "as" field, the output of the action will be ignored, and that is OK in most cases
                Available Actions:
                    ${
                        Agent.lib.map(lib =>
                            lib.actions.map(action => {
                                return ` - ${lib.name}.${action.name}: ${JSON.stringify({
                                    input: action.input,
                                    output: action.output
                                }, null, 4)}`
                            })
                        )
                    }
                Example:
                    Request: Apaga el computador
                    Response: [
                        { command: "os.shutdown", input: {} }
                    ]
                    
                    Request: ¿Qué hora es?
                    Response: [
                        { command: "os.getTime", input: {}, as: "time" },
                        { command: "agent.say", input: { text: "Son las {time}" }}
                    ]

                    Request: Tengo hambre (No action available)
                    Response: []
            `.split("\n").map(x => x.trim()).join("\n"),

            schema: Schema({
                commands: ArraySchema("List of commands to execute", Schema({
                    command: StringSchema("The command to execute"),
                    input: AnySchema("The input of the command, must match the input schema of the action"),
                    as: StringSchema("The output of the command, must match the output schema of the action")
                }, [ "command", "input" ]))
            })
        });

        const result = await OpenAIFeature.prompt<any>(mindset, prompt);
        const plan = new ExecutionPlan(prompt, result.commands.map(command =>
            new ExecutionPlanStep(command.command, command.input, command.as)
        ));

        ExecutionPlan.$events.next({ type: "create:end", input: prompt, plan, timestamp: Date.now() });

        return plan;
    }


}