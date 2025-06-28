export class CustomError extends Error {
    public code: string;

    constructor (code: string, message: string) {
        super(message);

        this.code = code;
    }
}

export function CustomErrors (errors: Record<string, string>) {
    const customErrors: Record<string, CustomError> = {};

    for (const [code, message] of Object.entries(errors)) {
        customErrors[code] = new CustomError(code, message);
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
    const code = error.code;
    const message = parseTextTemplate(error.message, data ?? {});

    throw new CustomError(code, message);
}