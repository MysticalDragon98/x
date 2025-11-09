import { ZodFeature } from "@/features/zod";
import * as z from "zod";

interface HTTPEndpointOptions<T> {
    inputValidator: any,
    params: {
        name: string;
        type: string;
        required: boolean;
        default?: string;
    }[],
    exec: (...input: any[]) => any;
}

export class HTTPEndpoint<T> {
    
    readonly inputValidator: z.ZodObject<any>;
    readonly params: { name: string; type: string; required: boolean; default?: string }[];
    readonly callback: (...input: any[]) => any;

    constructor (options: HTTPEndpointOptions<T>) {
        this.inputValidator = options.inputValidator;
        this.callback = options.exec;
        this.params = options.params;
    }

    exec (input: any) {
        const params: T = ZodFeature.validate(this.inputValidator, input);
        const argNames = this.params.map(param => param.name);
        const args = argNames.map(name => (<any>params)[name]);

        return this.callback(...args);
    }

}