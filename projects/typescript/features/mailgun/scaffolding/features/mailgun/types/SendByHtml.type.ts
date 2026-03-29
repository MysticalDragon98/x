export interface SendByHtmlOptions {
    to: string | string[];
    subject: string;
    templateString: string;
    data: Record<string, any>;
    from?: string;
}
