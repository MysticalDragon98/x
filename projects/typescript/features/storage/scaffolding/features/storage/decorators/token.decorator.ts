import { FieldType } from "../classes/FieldType"
import { Index } from "../classes/Index";

interface ISerializable<Instance, Primitive> {
    serialize?: (value: Instance) => Primitive;
    deserialize? (value: Primitive): Instance;
}

export interface TokenOptions {
    description?: string;
    id?: string;
    indexes?: Index<any>[]
}

export const TokenMetadata = new Map<any, {
    fieldType: FieldType<any, any>;
    id?: string;
    indexes?: Index<any>[];
}>();
export function Token<Primitive> (options: TokenOptions = {}) {
    return function <C extends new (...args: any[]) => any>(target: C & ISerializable<InstanceType<C>, Primitive>) {
        TokenMetadata.set(target, {
            id: options.id,
            fieldType: new FieldType<InstanceType<C>, Primitive>({
                name: target.name,
                description: options.description,
                validate: (value: InstanceType<C>) => {},
                deserialize: (value: Primitive) => target.deserialize? target.deserialize(value) as InstanceType<C> : FieldType.deserializeRecursive(target, value),
                serialize: (value: InstanceType<C>) => target.serialize? target.serialize(value) : FieldType.serializeRecursive(value)
            }),
            indexes: options.indexes
        });
    }
}