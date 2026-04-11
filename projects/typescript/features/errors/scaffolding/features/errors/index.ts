export class CustomError extends Error {
    public code: string;
    public args: any[];

    constructor (code: string, message: string, args: any[]) {
        super(message);

        this.code = code;
        this.args = args;
    }
}

export function CustomErrors (errors: Record<string, (...args: any[]) => string>) {
    const customErrors: Record<string, (...args: any[]) => CustomError> = {};

    for (const [code, message] of Object.entries(errors)) {
        customErrors[code] = (...args: any[]) => new CustomError(code, message(...args), args);
    }

    return customErrors;
}

export const $assert = (expression: any, error: CustomError) => { 
    if (typeof expression === "function") {
        try {
            return expression();
        } catch (e) {
            $throw(error);
        }
    }
    
    if (!expression) $throw(error);

    return expression;
}

export const $throw = (error: CustomError) => {
    throw error;
}

type ErrorMapper = Record<string, (error: CustomError) => CustomError> & { _?: (error: CustomError) => CustomError };

export async function $mapError<T> (promise: Promise<T>, mapper: ErrorMapper): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        if (error instanceof CustomError) {
            const handler = mapper[error.code] ?? mapper._;
            if (handler) $throw(handler(error));
        }

        throw error;
    }
}

export async function $shouldFail<T> (promise: Promise<T>, error: CustomError) {
    try {
        await promise;
    } catch (exc) { return; }
    
    throw error;
}