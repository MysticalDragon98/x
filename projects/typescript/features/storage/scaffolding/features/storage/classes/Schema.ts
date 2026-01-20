import { $assert, CustomErrors } from "@/features/errors";
import { TokenMetadata } from "../decorators/token.decorator";
import { Field } from "./Field";
import { Index } from "./Index";
import { FieldMetadata } from "../decorators/field.decorator";
import { Objects } from "@/features/utils/classes/Objects";
import { FieldType } from "./FieldType";

export const SchemaErrors = CustomErrors({
    ClassNotAToken: (name: string) => `Class '${name}' is not a valid token. Ensure it is initialized with the @Token decorator`,
    ClassSchemaMustHaveId: (name: string) => `Class '${name}' must have an id field in order to be used as a schema.`,
    ClassDoesNotHaveFields: (name: string) => `Class '${name}' does not have any fields.`
})

export interface SchemaOptions<T> {
    fields: { [K in keyof T]: Field<T[K]> };
    indexes?: Index<T>[];
    id: keyof T;
    name: string;
}

export class Schema<T, ID> {
    
    readonly name: string;
    readonly id: keyof T;
    readonly fields: { [K in keyof T]: Field<T[K]> };
    readonly indexes: Index<T>[];

    constructor (options: SchemaOptions<T>) {
        this.fields = options.fields;
        this.indexes = options.indexes ?? [];
        this.id = options.id;
        this.name = options.name;
    }

    deserialize (data: T) {
        const result: Partial<T> = {};

        for (const key in this.fields) {
            const field = this.fields[key];

            if (field.array) {
                const element: any[] = [];
                for (const item of data[key] as any) {
                    element.push(field.type.deserialize(item));
                }

                result[key] = element as any;

                continue;
            }

            result[key] = field.type.deserialize(data[key]);
            field.type.validate(result[key]!);
        }

        return result as T;
    }

    serialize (data: T) {
        const result: Partial<T> = {};

        for (const key in this.fields) {
            const field = this.fields[key];
            if (data[key] === undefined && !field.required) continue;
            
            
            if (field.array) {
                const element: any[] = [];
                for (const item of data[key] as any) {
                    element.push(field.type.serialize(item));
                }
                result[key] = element as any;

                continue;
            }

            field.type.validate(data[key]!);
            result[key] = field.type.serialize(data[key]);
        }

        return result as T;
    }

    serializeMany (data: T[]) {
        return data.map(item => this.serialize(item));
    }

    serializePartial (data: Partial<T> = {}) {
        const result: Partial<T> = {};
        
        for (const key in this.fields) {
            const field = this.fields[key];
            if (data[key] === undefined) continue;
            
            field.type.validate(data[key]!);
            if (field.array) {
                const element: any[] = [];
                for (const item of data[key] as any) {
                    element.push(field.type.serialize(item));
                }
                result[key] = element as any;

                continue;
            } else {
                result[key] = field.type.serialize(data[key]);
            }
        }

        return result;
    }

    validate (data: T) {
        for (const key in this.fields) {
            const field = this.fields[key];
            field.type.validate(data[key]);
        }
    }

    validatePartial (data: Partial<T>) {
        for (const key in this.fields) {
            const field = this.fields[key];
            if (data[key] === undefined) continue;
            
            field.type.validate(data[key]);
        }
    }

    serializeId (id: ID) {
        return this.fields[this.id].type.serialize(id as any);
    }

    deserializeId (id: ID) {
        return this.fields[this.id].type.deserialize(id as any);
    }

    itemId (item: T) {
        return item[this.id] as ID;
    }

    static fromClass<C, T> (constructor: new (...args: any[]) => C) {
        const metadata = TokenMetadata.get(constructor)!;
        const fields = FieldMetadata.get(constructor.prototype);

        $assert(fields, SchemaErrors.ClassNotAToken(constructor.name));
        $assert(metadata, SchemaErrors.ClassNotAToken(constructor.name));
        $assert(metadata.id, SchemaErrors.ClassSchemaMustHaveId(constructor.name));
        $assert(fields, SchemaErrors.ClassDoesNotHaveFields(constructor.name));

        const indexes = [...(metadata.indexes ?? [])];

        for (const fieldName in fields) {
            const field = fields[fieldName];

            if (!field.index) continue;

            indexes.push(new Index<any>({
                name: fieldName,
                fields: [fieldName],
                unique: field.unique
            }));

        }

        return new Schema<C, T>(<any>{
            id: metadata.id!,
            name: constructor.name,
            fields: Objects.map(fields!, (field: any, fieldName: string) => new Field({
                name: fieldName,
                type: FieldType.fromClass(field.class),
                required: field.required,
                description: field.description,
                array: field.array
            })),

            indexes
        })
    }
}