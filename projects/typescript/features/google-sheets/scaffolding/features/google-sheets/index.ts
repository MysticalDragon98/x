import { $assert, CustomErrors } from "@/features/errors";
import LogsFeature from "@/features/logs";
import { google, sheets_v4 } from "googleapis";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { Sheet } from "./classes/sheet";

const logger = LogsFeature.logger("@modules/google-sheets");
const GCLOUD_KEYFILE = "gcloud-key.json";
const Errors = CustomErrors({
    GoogleCloudKeyfileNotFound: "Couldn't find the service account key file `{path}`",
    GoogleCloudClientNotInitialized: "The Google Cloud client has not been initialized yet"
});

export default class GoogleSheetsFeature {
    
    static #client: sheets_v4.Sheets;

    static async init () {
        const key: any = await GoogleSheetsModule.loadKeyFromFile(GCLOUD_KEYFILE);

        this.#client = google.sheets({
            version: "v4",
            auth: new google.auth.GoogleAuth({
                credentials: key,
                scopes: ["https://www.googleapis.com/auth/spreadsheets"]
            })
        });

        logger.ok("Initialized google sheets client");
    }

    static client () {
        $assert(this.#client, Errors.GoogleCloudClientNotInitialized);

        return this.#client;
    }

    static async sheet (id: string) {
        return await new Sheet(this.#client, id).init();
    }

    static async loadKeyFromFile (path: string) {
        $assert(existsSync(path), Errors.GoogleCloudKeyfileNotFound, { path });

        return JSON.parse(await readFile(path, "utf-8"));
    }

    static parseGoogleCloudResponse (response: any) {
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    }

}