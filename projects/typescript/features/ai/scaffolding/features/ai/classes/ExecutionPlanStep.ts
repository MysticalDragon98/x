import { randomUUID } from "crypto";
import { Agent } from "./Agent";
import { ExecutionContext } from "./ExecutionContext";

export class ExecutionPlanStep {

    public command: string;
    public input: any;
    public as: string;
    public id: string = randomUUID();
    public duration?: number;

    constructor (command: string, input: any, as?: string) {
        this.command = command;
        this.input = input;
        this.as = as;
    }

    async execute (ctx: ExecutionContext) {
        const start = Date.now();
        const action = Agent.getAction(this.command);
        const output = await action.execute.apply({ context: ctx }, [ this.input ]);

        if (this.as) ctx.setVariable(this.as, output);

        this.duration = Date.now() - start;
    }

}