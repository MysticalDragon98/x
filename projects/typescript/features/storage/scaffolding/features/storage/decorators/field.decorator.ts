
export interface FieldOptions {
    optional?: boolean;
    index?: boolean;
    unique?: boolean;
}

export const FieldMetadata = new Map<any, {
    [field: string]: {
        class: any,
        array: boolean,
        index: boolean,
        required: boolean,
        unique: boolean
    }
}>();
export function Field<C extends new (...args: any[]) => any> (baseClass: C | [C], options: FieldOptions = {}) {

    return function (target: any, name: any) {
        const isArray = Array.isArray(baseClass);
        if (isArray) baseClass = (baseClass as [C])[0];
        
        FieldMetadata.set(target, {
            ...(FieldMetadata.get(target) ?? {}),
            [name]: {
                class: baseClass,
                array: isArray,
                required: !options.optional,
                index: options.index,
                unique: !!options.unique
            }
        });
    }
}