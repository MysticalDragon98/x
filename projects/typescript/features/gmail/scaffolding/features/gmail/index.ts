import { $assert, CustomErrors } from "@/features/errors";
import LogsFeature from "@/features/logs";
import GoogleFeature from "../google";
import { GoogleTokens } from "../google/types/google-tokens.type";
import { gmail_v1, google } from "googleapis";
import { SetStorage } from "../storage/classes/SetStorage";
import { Queue } from "@/features/queue/classes/queue";
import QueueFeature from "@/features/queue";

const Errors = CustomErrors({
    GoogleNotInitialized: () => "The Google module needs to be initialized before using this module."
});

export default class GmailFeature {
    static #logger = LogsFeature.logger("@modules/gmail");
    static #gmail: gmail_v1.Gmail;

    static async init ({ tokens }: { tokens: GoogleTokens }) {
        $assert(GoogleFeature.isInitialized(), Errors.GoogleNotInitialized());
        
        this.#gmail = google.gmail({
            version: "v1",
            auth: GoogleFeature.oauth2FromTokens(tokens)
        });
        
        this.#logger.ok('Gmail module initialized');
    }

    static async list (limit: number) {
        const response = await this.#gmail.users.messages.list({
            userId: "me",
            labelIds: ["INBOX"],
            maxResults: limit
        });

        return response.data.messages ?? [];
    }

    static async listUnread (limit: number, storage: SetStorage) {
        const list = await this.list(limit);
        const emails: string[] = [];

        await QueueFeature.batch(list, async (email) => {
            if (!await storage.has(email.id!)) {
                emails.push(email);
            }
        });

        return emails;
    }

    static async watch (storage: SetStorage, callback: (email: any) => any) {
        while (true) {
            const list = await this.listUnread(10, storage);
            await QueueFeature.batch(list, async (email) => {
                const content = await this.#gmail.users.messages.get({
                    userId: "me",
                    id: email.id!,
                    format: "full",
                    metadataHeaders: ["Subject", "From", "Date"]
                });

                await storage.add(email.id!);

                callback(content.data);
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    static from (email: any) {
        const headers = email.payload?.headers ?? [];
        const from = headers.find((header: { name: string, value: string }) => header.name === "From")?.value ?? "";

        return from;
    }

}