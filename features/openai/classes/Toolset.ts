import { Tool } from "./Tool";

export class Toolset {
    readonly tools: Tool[];

    constructor (tools: Tool[]) {
        this.tools = tools;
    }

    get (name: string) {
        return this.tools.find(tool => tool.name === name);
    }
}