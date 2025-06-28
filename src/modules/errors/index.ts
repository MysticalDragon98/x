import { NamedError } from "./named-error";

function parseTextTemplate (text: string, variables: any) {
    // Replace all {variable} with variable
    return text.replace(/\{([^\}]+)\}/g, (match, variable) => {
        return variables[variable] ?? match;
    });
}


export const $assert = (expression: any, error: { [key: string]: string }, data?: string | object) => { 
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

export const $parseError = (error: { [key: string]: string }, data?: string | object) => {
    const code = Object.keys(error)[0];
    const message = parseTextTemplate(error[code], data ?? {});

    return new NamedError(message, code);
}

export const $throw = (error: { [key: string]: string }, data?: string | object) => {
    const code = Object.keys(error)[0];
    const message = parseTextTemplate(error[code], data ?? {});

    throw new NamedError(message, code);
}