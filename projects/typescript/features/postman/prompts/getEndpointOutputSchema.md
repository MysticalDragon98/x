Analyze the provided endpoint and reply in pure JSON the output schema.
Assume the HTTPResponse schema follows this type:

export type HTTPResponseInstance = {
    status: number;
    body: any;
};

export type HTTPResponseType = {
    new (status: number, body: any): HTTPResponseInstance;
    Ok(message: string, data?: any): HTTPResponseInstance;
    NotFound(endpoint: string): HTTPResponseInstance;
    InternalServerError(error: CustomError | CustomError[]): {
        status: 500;
        body: { code: string; message: string } | { message: string; errors: { code: string; message: string }[] };
    };
};

Constraints: 
- Return raw JSON ONLY.
- Do NOT wrap the response in markdown.
- Do NOT use ``` or language tags.
- Do NOT add explanations, comments, or extra text.
- Output must start with { and end with }.
- Do not add schema validations
- Keep it as simple as possible