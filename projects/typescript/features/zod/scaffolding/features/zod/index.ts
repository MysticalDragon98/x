import { ZodError } from "zod/v4";
import { CustomErrors } from "../errors";

const Errors = CustomErrors({
    InvalidType: (path: string[], expected: string) =>
        `Expected type ${expected} at ${path.join('.')}`,
    InvalidFormat: (path: string[], format: string) =>
        `Invalid ${format} format at ${path.join('.')}`,
    UnrecognizedKeys: (path: string[], keys: string[]) =>
        `Unexpected keys found: ${keys.join(', ')} at ${path.join('.')}`,
    InvalidUnion: (path: string[]) =>
        `Value at ${path.join('.')} does not match any union member`,
    InvalidKey: (path: string[], origin: string) =>
        `Invalid ${origin} key at ${path.join('.')}`,
    InvalidElement: (path: string[], origin: string, key: unknown) =>
        `Invalid ${origin} element at ${path.join('.')} (key: ${key})`,
    InvalidValue: (path: string[], values: any[]) =>
        `Value at ${path.join('.')} must be one of: ${values.join(', ')}`,
    TooSmall: (path: string[], minimum: number | bigint, origin: string, inclusive?: boolean) =>
        `${origin} at ${path.join('.')} below minimum threshold of ${minimum} ${inclusive ? '(inclusive)' : '(exclusive)'}`,
    TooBig: (path: string[], maximum: number | bigint, origin: string, inclusive?: boolean) =>
        `${origin} at ${path.join('.')} exceeds maximum threshold of ${maximum} ${inclusive ? '(inclusive)' : '(exclusive)'}`,
    NotMultipleOf: (path: string[], divisor: number) =>
        `Value at ${path.join('.')} must be multiple of ${divisor}`,
    Custom: (path: string[], message: string, params?: Record<string, any>) =>
        `Validation failed at ${path.join('.')}: ${message}${params ? ` (${JSON.stringify(params)})` : ''}`,
    UnhandledValidationError: (path: string[], message: string) =>
        `Validation error at ${path.join('.')}: ${message}`
});

export class ZodFeature {

    static validate<T> (schema: any, data: any): T {
        try {
            return schema.parse(data) as any as T;
        } catch (exc) {
            if (!(exc instanceof ZodError)) throw exc;
            
            const errors = exc.issues.map(issue => {
                const path = issue.path.map(String);
                
                switch (issue.code) {
                    case 'invalid_type':
                        return Errors.InvalidType(path, issue.expected);
                    
                    case 'invalid_format':
                        return Errors.InvalidFormat(path, issue.format);
                    
                    case 'unrecognized_keys':
                        return Errors.UnrecognizedKeys(path, issue.keys);
                    
                    case 'invalid_union':
                        return Errors.InvalidUnion(path);
                    
                    case 'invalid_key':
                        return Errors.InvalidKey(path, issue.origin);
                    
                    case 'invalid_element':
                        return Errors.InvalidElement(path, issue.origin, issue.key);
                    
                    case 'invalid_value':
                        return Errors.InvalidValue(path, issue.values);
                    
                    case 'too_small':
                        return Errors.TooSmall(path, issue.minimum, issue.origin, issue.inclusive);
                    
                    case 'too_big':
                        return Errors.TooBig(path, issue.maximum, issue.origin, issue.inclusive);
                    
                    case 'not_multiple_of':
                        return Errors.NotMultipleOf(path, issue.divisor);
                    
                    case 'custom':
                        return Errors.Custom(path, issue.message, issue.params);
                }
            });

            throw errors;
        }
    }

}