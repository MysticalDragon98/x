import { $assert, CustomErrors } from "@/features/errors";
import { FieldType } from "../classes/FieldType"
import { Index } from "../classes/Index";

interface ISerializable<Instance, Primitive> {
    serialize?: (value: Instance) => Primitive;
    deserialize? (value: Primitive, C?: new (...args: any[]) => Instance): Instance;
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
            indexes: [...(options.indexes ?? []), ...(options.id? [new Index<any>({ name: options.id, fields: [options.id], unique: true })] : [])]
        });
    }
}

const Errors = CustomErrors({
    InvalidDate: (date: string) => `Date ${date} is invalid`
});

TokenMetadata.set(Date, {
    fieldType: new FieldType<Date, Date>({
        name: 'Date',
        validate () {},
        serialize: (value: Date) => value,
        deserialize: (value: Date) => {
            const date = new Date(value);

            $assert(!isNaN(date.getTime()), Errors.InvalidDate(String(value)));

            return date;
        }
    })
});



TokenMetadata.set(String, {
    fieldType: new FieldType<string, string>({
        name: 'String',
        validate () {},
        serialize: (value: string) => value,
        deserialize: (value: string) => value
    })
});

TokenMetadata.set(Number, {
    fieldType: new FieldType<number, number>({
        name: 'Number',
        validate () {},
        serialize: (value: number) => value,
        deserialize: (value: number) => value
    })
});

TokenMetadata.set(Boolean, {
    fieldType: new FieldType<boolean, boolean>({
        name: 'Boolean',
        validate () {},
        serialize: (value: boolean) => value,
        deserialize: (value: boolean) => value
    })
});
