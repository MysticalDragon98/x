import { $assert, CustomErrors } from "@/features/errors";
import { FieldType } from "../classes/FieldType";
import { getValueType } from "../fn/getValueType";

const Errors = CustomErrors({
    ValueMustBeString: (type: string) => `The value must be of type string, but type "${type}" was found`,
    MinLength: (minLength: number) => `The value must be at least ${minLength} characters long`,
    MaxLength: (maxLength: number) => `The value must be at most ${maxLength} characters long`,
    Pattern: (pattern: string) => `The value must match the pattern ${pattern}`
});

const _StringField = new FieldType<string>({
    name: 'string',
    validate: (value: string) => {
        const type = getValueType(value);
        
        $assert(type === 'string', Errors.ValueMustBeString(type));
    }
});

type StringFieldOptions = {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

export function StringField (options: StringFieldOptions = {}) {
    if (Object.keys(options).length === 0) return _StringField;

    return new FieldType<string>({
        name: 'string',
        validate: (value: string) => {
            const type = getValueType(value);
            
            $assert(type === 'string', Errors.ValueMustBeString(type));
            $assert(options.minLength === undefined || value.length >= options.minLength, Errors.MinLength(options.minLength));
            $assert(options.maxLength === undefined || value.length <= options.maxLength, Errors.MaxLength(options.maxLength));
            $assert(options.pattern === undefined || options.pattern.test(value), Errors.Pattern(options.pattern));

            return value;
        }
    })
}