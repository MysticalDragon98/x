import { $assert, CustomErrors } from "@/features/errors";
import { FieldMetadata } from "../decorators/field.decorator";
import { TokenMetadata } from "../decorators/token.decorator";

const Errors = CustomErrors({
    InvalidClass: (name: string) => `Class ${name} is not a valid FieldType. Ensure it is initialized with the @Token decorator`
})

export class FieldType<DeserializedType, SerializedType = DeserializedType> {
    
    readonly name: string;
    readonly description?: string;
    readonly validate: (value: DeserializedType) => void;
    readonly serialize: (value: DeserializedType) => SerializedType;
    readonly deserialize: (value: SerializedType) => DeserializedType;

    constructor ({ name, validate, serialize, deserialize }: {
        name: string,
        description?: string,
        validate: (value: DeserializedType) => void,
        serialize?: (value: DeserializedType) => SerializedType,
        deserialize?: (value: SerializedType) => DeserializedType
    }) {
        this.name = name;
        this.validate = validate;
        this.serialize = serialize ?? ((value: DeserializedType) => value as any);
        this.deserialize = deserialize ?? ((value: SerializedType) => value as any);
    }

    extended<T> ({ name, validate, serialize, deserialize }: {
        name: string,
        validate: (value: T) => void,
        serialize: (value: T) => DeserializedType,
        deserialize: (value: DeserializedType) => T
    }): FieldType<T, SerializedType> {
        return new FieldType<T, SerializedType>({
            name,
            validate: (value: T) => {
                const deserializedValue = serialize(value);
                this.validate(deserializedValue);

                validate(value);
            },

            serialize: (value: T) => {
                let serializedValue: DeserializedType = serialize(value);
                if (this.serialize) return this.serialize(serializedValue);
                
                return serializedValue as any as SerializedType;
            },

            deserialize: (value: SerializedType) => {
                let deserializedValue = (this.deserialize ? this.deserialize(value) : value) as DeserializedType;
                
                return deserialize(deserializedValue);
            }
        });
    }

    static fromClass<C extends abstract new (...args: any[]) => any> (target: C): FieldType<InstanceType<C>, any> {
        const token = TokenMetadata.get(target);
        
        $assert(token, Errors.InvalidClass(target.name)); // Check if our specific token exists

        return token?.fieldType as FieldType<InstanceType<C>, any>;
    }

    static fields (target: any) {
        return FieldMetadata.get(target);
    }

    static serializeRecursive (value: any) {
        const fields = FieldType.fields(value.constructor.prototype);
        if (!fields) return value;

        const result: any = {};

        for (const fieldName in value) {
            const field = fields[fieldName];

            if (!field) {
                result[fieldName] = value[fieldName];
                continue;
            }

            if (field.array) {
                const element: any[] = [];
                for (const item of value[fieldName]) {
                    element.push(field.class.serialize(item));
                }

                result[fieldName] = element;
                continue;
            }

            result[fieldName] = field.class.serialize(value[fieldName]);
        }
         
        return result;
    }

    static deserializeRecursive<C extends new (...args: any[]) => any> (constructor: C, value: any) {
        const fields = FieldType.fields(constructor.prototype);
        if (!fields) return value;

        const result: any = {};
        for (const fieldName in value) {
            const field = fields[fieldName];

            if (!field) {
                result[fieldName] = value[fieldName];
                continue;
            }

            if (field.array) {
                const element: any[] = [];
                for (const item of value[fieldName]) {
                    element.push(field.class.deserialize(item));
                }

                result[fieldName] = element;
                continue;
            }

            result[fieldName] = field.class.deserialize(value[fieldName]);
        }

        return new constructor(result) as InstanceType<C>;
    }
}