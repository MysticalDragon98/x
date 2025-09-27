import LogsFeature from "@/features/logs";
import { readFile } from "fs/promises";
import { GoogleTokens } from "./types/google-tokens.type";
import { google } from "googleapis";

export default class GoogleFeature {
    
    static #logger = LogsFeature.logger("@modules/google");
    static #credentials: any;

    static async init (credentials: string | any) {
        const content = typeof credentials === 'string' ?
            await GoogleFeature.getCredentialsFromFile(credentials) :
            credentials.installed ?? credentials.web;

        this.#credentials = content;
        this.#logger.ok('Google module initialized');
    }

    static isInitialized () {
        return !!this.#credentials;
    }

    static credentials () {
        return this.#credentials;
    }

    static async getCredentialsFromFile (path: string) {
        const content = JSON.parse(await readFile(path, "utf-8"));
        return content.installed ?? content.web;
    }

    static oauth2FromTokens (tokens: GoogleTokens) {
        const oauth2 = new google.auth.OAuth2(this.#credentials.client_id, this.#credentials.client_secret);

        oauth2.setCredentials(tokens);

        return oauth2;
    }

    static async generateOAuthUrl (scopes: string[], callback: string) {
        const oauth2 = new google.auth.OAuth2(this.#credentials.client_id, this.#credentials.client_secret, callback);

        return oauth2.generateAuthUrl({
            access_type: "offline",
            scope: scopes
        });
    }

}