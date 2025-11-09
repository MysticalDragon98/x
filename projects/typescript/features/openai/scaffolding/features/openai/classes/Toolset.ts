import { Tool } from "./Tool";

export class Toolset {
    readonly tools: Tool[];
    readonly capabilities?: ("web_search")[];

    constructor (tools: Tool[], capabilities?: ("web_search")[]) {
        this.tools = tools;
        this.capabilities = capabilities;
    }

    get (name: string) {
        return this.tools.find(tool => tool.name === name);
    }
}