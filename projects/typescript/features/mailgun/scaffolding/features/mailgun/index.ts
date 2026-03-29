import Handlebars from 'handlebars';
import { $assert, CustomErrors } from '@features/errors';
import { Environment } from '@features/env';
import LogsFeature from '@features/logs';
import type { SendByTemplateOptions } from './types/SendByTemplate.type';
import type { SendByHtmlOptions } from './types/SendByHtml.type';
import type { MailgunResponse } from './types/MailgunResponse.type';

const log = LogsFeature.logger('@features/mailgun');

const Errors = CustomErrors({
    NotInitialized: () =>
        'MailgunFeature has not been initialized. Call MailgunFeature.init() first.',
    MailgunApiError: (status: number, body: string) =>
        `Mailgun API returned status ${status}: ${body}`,
    InvalidRecipient: () =>
        'Email recipient (to) must be a non-empty string or array of strings.',
    TemplateCompilationFailed: (message: string) =>
        `Failed to compile Handlebars template: ${message}`,
});

export class MailgunFeature {
    static #initialized = false;

    static init() {
        this.#initialized = true;
        log.ok('Mailgun feature initialized');
    }

    static async sendByTemplate(options: SendByTemplateOptions): Promise<MailgunResponse> {
        $assert(this.#initialized, Errors.NotInitialized());
        $assert(options.to && (typeof options.to === 'string' || options.to.length > 0), Errors.InvalidRecipient());

        const formData = new FormData();
        formData.append('from', options.from ?? Environment.MailgunFrom!);
        formData.append('to', Array.isArray(options.to) ? options.to.join(',') : options.to);
        formData.append('subject', options.subject);
        formData.append('template', options.template);
        formData.append('h:X-Mailgun-Variables', JSON.stringify(options.variables));

        log.debug(`Sending template email "${options.template}" to ${options.to}`);
        return this.#send(formData);
    }

    static async sendByHtml(options: SendByHtmlOptions): Promise<MailgunResponse> {
        $assert(this.#initialized, Errors.NotInitialized());
        $assert(options.to && (typeof options.to === 'string' || options.to.length > 0), Errors.InvalidRecipient());

        let html: string;
        try {
            const compiled = Handlebars.compile(options.templateString);
            html = compiled(options.data);
        } catch (exc: any) {
            throw Errors.TemplateCompilationFailed(exc?.message ?? 'Unknown error');
        }

        const formData = new FormData();
        formData.append('from', options.from ?? Environment.MailgunFrom!);
        formData.append('to', Array.isArray(options.to) ? options.to.join(',') : options.to);
        formData.append('subject', options.subject);
        formData.append('html', html);

        log.debug(`Sending HTML email to ${options.to}`);
        return this.#send(formData);
    }

    static async #send(formData: FormData): Promise<MailgunResponse> {
        const url = `https://api.mailgun.net/v3/${Environment.MailgunDomain}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`api:${Environment.MailgunApiKey}`)}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorBody = await response.text();
            log.error(`Mailgun API error: ${response.status} - ${errorBody}`);
            throw Errors.MailgunApiError(response.status, errorBody);
        }

        const result = await response.json() as MailgunResponse;
        log.debug(`Email sent successfully: ${result.id}`);
        return result;
    }
}
