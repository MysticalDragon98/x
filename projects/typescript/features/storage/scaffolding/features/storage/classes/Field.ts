import { FieldType } from "./FieldType";

export class Field<T> {
    
    readonly description?: string;
    readonly name: string;
    readonly type: FieldType<T, any>;
    readonly array: boolean;
    readonly defaultValue?: T;
    readonly required?: boolean = false;
    
    constructor (options: { description?: string, name: string, type: FieldType<T, any>, defaultValue?: T, required?: boolean, array?: boolean }) {
        this.description = options.description;
        this.name = options.name;
        this.type = options.type;
        this.defaultValue = options.defaultValue;
        this.required = options.required;
        this.array = options.array ?? false;
    }

}