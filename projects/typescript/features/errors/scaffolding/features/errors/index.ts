export class CustomError extends Error {
    public code: string;

    constructor (code: string, message: string) {
        super(message);

        this.code = code;
    }
}

export function CustomErrors (errors: Record<string, ((...args: any[]) => string) | string>) {
    const customErrors: Record<string, (...args: any[]) => CustomError> = {};

    for (const [code, message] of Object.entries(errors)) {
        if (typeof message === 'string')
            customErrors[code] = (...args: any[]) => new CustomError(code, parseTextTemplate(message, args));
        else
            customErrors[code] = (...args: any[]) => new CustomError(code, message(...args));
    }

    return customErrors;
}

function parseTextTemplate (text: string, variables: any) {
    // Replace all {variable} with variable
    return text.replace(/\{([^\}]+)\}/g, (match, variable) => {
        return variables[variable] ?? match;
    });
}


export const $assert = (expression: any, error: CustomError, data?: string | object) => { 
    if (typeof expression === "function") {
        try {
            return expression();
        } catch (e) {
            $throw(error, data);
        }
    }
    
    if (!expression) $throw(error, data);

    return expression;
}

export const $parseError = (error: CustomError, data?: string | object) => {
    const code = error.code;
    const message = parseTextTemplate(error.message, data ?? {});

    return new CustomError(code, message);
}

export const $throw = (error: CustomError, data?: string | object) => {
    const code = error.code 
    const message = data ? parseTextTemplate(error.message, data ?? {}) : error.message;

    throw new CustomError(code, message);
}

export async function $shouldFail<T> (promise: Promise<T>, error: CustomError) {
    try {
        await promise;
    } catch (exc) { return; }
    
    throw error;
}