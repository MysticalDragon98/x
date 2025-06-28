import { FunctionParameters } from "openai/resources/shared";
export class Tool<T = any> { 
    readonly name: string;
    readonly description: string;
    readonly parameters: FunctionParameters;

    readonly callback: (args: T) => Promise<any>;

    constructor ({ name, description, parameters, callback }: {
        name: string,
        description: string,
        parameters: FunctionParameters,
        callback: (args: T) => Promise<any>
    }) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
        this.callback = callback;
    }
}