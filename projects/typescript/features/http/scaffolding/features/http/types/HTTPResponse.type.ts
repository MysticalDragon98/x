import { CustomError } from "@/features/errors";

export class HTTPResponse {
    status: number;
    body: any;

    constructor (status: number, body: any) {
        this.status = status;
        this.body = body;
    }

    static Ok (message: string, data: any = null) { 
        return new HTTPResponse(200, {
            message,
            data
        })
    }

    static NotFound (endpoint: string) {
        return new HTTPResponse(404, {
            message: `Endpoint ${endpoint} not found`
        })
    }

    static InternalServerError (error: CustomError | CustomError[]) {
        if (error instanceof CustomError) return ({
            status: 500,
            body: {
                code: error.code,
                message: error.message
            }
        });

        return {
            status: 500,
            body: {
                message: "Internal server error",
                errors: (error as CustomError[]).map(err => ({
                    code: err.code,
                    message: err.message
                }))
            }
        }
    }
}