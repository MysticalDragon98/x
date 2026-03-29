export interface SendByTemplateOptions {
    to: string | string[];
    subject: string;
    template: string;
    variables: Record<string, any>;
    from?: string;
}
