import { sheets_v4 } from "googleapis";
import { Vector2 } from "../../geometry/classes/vector2";
import GoogleSheetsModule from "..";
import { Vector3 } from "../../geometry/classes/vector3";
import { $assert, CustomErrors } from "@/features/errors";
import { SheetsCursor } from "./sheets-cursor";
import { SheetRange } from "./sheet-range";
import { SheetPage } from "./sheet-page";

const Errors = CustomErrors({
    CellOutOfBounds: "The cell `{addr}` is out of bounds"
});

export class Sheet {
    
    public readonly id: string;
    readonly #client: sheets_v4.Sheets;
    #pages: string[] = [];

    constructor (client: sheets_v4.Sheets, id: string) {
        this.id = id;
        this.#client = client;
    }

    async init () {
        this.#pages = await this.pages();
        return this;
    }

    async pages () {
        const response = await this.#client.spreadsheets.get({
            spreadsheetId: this.id
        });

        const result = GoogleSheetsModule.parseGoogleCloudResponse(response);

        return result.sheets.map((sheet: any) => sheet.properties.title) as string[];
    }

    async read (addr: Vector3) {
        const response = await this.#client.spreadsheets.values.get({
            spreadsheetId: this.id,
            range: this.vec2Cell(addr)
        });

        const { values } = GoogleSheetsModule.parseGoogleCloudResponse(response);

        return values?.[0]?.[0] ?? null;
    }

    async write (addr: Vector3, value: string) {
        const response = await this.#client.spreadsheets.values.update({
            spreadsheetId: this.id,
            range: this.vec2Cell(addr),
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[value]]
            }
        });

        return GoogleSheetsModule.parseGoogleCloudResponse(response);
    }

    async readRange (start: Vector3, end: Vector3): Promise<string[][]> {
        const range = `${this.vec2Cell(start)}:${this.vec2Cell(end, { pageless: true })}`;
        const response = await this.#client.spreadsheets.values.get({
            spreadsheetId: this.id,
            range: `${this.vec2Cell(start)}:${this.vec2Cell(end, { pageless: true })}`
        });

        const { values } = GoogleSheetsModule.parseGoogleCloudResponse(response);

        return values;
    }

    async readRichRange (start: Vector3, end: Vector3): Promise<string[][]> {
        const range = `${this.vec2Cell(start)}:${this.vec2Cell(end, { pageless: true })}`;
        const response = await this.#client.spreadsheets.values.get({
            spreadsheetId: this.id,
            range: `${this.vec2Cell(start)}:${this.vec2Cell(end, { pageless: true })}`
        });

        const { values } = GoogleSheetsModule.parseGoogleCloudResponse(response);

        return values;
    }

    cursor (addr: Vector3) {
        return new SheetsCursor(this, addr);
    }

    range (start: Vector3, end: Vector3) {
        return new SheetRange(this, start, end);
    }

    vec2Cell(vec: Vector3, { pageless: pageless = false } = {}) {
        function numberToColumn(n: number): string {
            let result = '';
            n++; // Excel columns are 1-indexed
            while (n > 0) {
            const rem = (n - 1) % 26;
            result = String.fromCharCode(65 + rem) + result;
            n = Math.floor((n - 1) / 26);
            }
            return result;
        }

        const col = numberToColumn(vec.x);
        const row = vec.y + 1; // Excel rows are also 1-indexed
        const page = this.#pages[vec.z];

        $assert(page, Errors.CellOutOfBounds, { addr: `${vec.x},${vec.y},${vec.z}` });

        if (pageless) {
            return `${col}${row}`;
        }

        return `'${page}'!${col}${row}`;
    }

    page (page: number) {
        return new SheetPage(this, page);
    }

}