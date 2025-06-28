import { $parseError } from "../errors";
import { NamedError } from "../errors/named-error";

export class CLIResult {

    readonly success: boolean;
    readonly message: string;
    readonly data: any;
    readonly error?: NamedError;

    constructor(options: { success: boolean, message: string, data?: any, error?: NamedError }) {
        this.success = options.success;
        this.message = options.message;
        this.data = options.data;
        this.error = options.error;
    }


    static error (err: { [code: string]: string }, data: any = {}) {
        const error = $parseError(err, data);

        return new CLIResult({
            success: false,
            message: error.message,
            error
        });
    }

    static fromError (error: any) {
        return new CLIResult({
            success: false,
            message: error.message,
            error: new NamedError(error.code, error.message)
        });
    }

    static success (message: string, data?: any) {
        return new CLIResult({
            success: true,
            message,
            data
        });
    }

}