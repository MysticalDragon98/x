import { ExecutionContext } from "./ExecutionContext";

export interface LibraryOptions {
    name: string;
    actions: {
        name: string,
        description: string,
        input: any,
        output: string | object,
        execute: (input: any, context: ExecutionContext) => any;
    }[]

}

export class Library {
    name: string;
    actions: LibraryOptions["actions"] = [];

    constructor (options: LibraryOptions) {
        this.name = options.name;
        this.actions = options.actions;
    }

}