import { Vec3 } from "../../geometry/classes/vector3";
import { Sheet } from "./sheet";
import { SheetPage } from "./sheet-page";

const MAX_ROWS = 100000000;
export class SheetColumn {
    
    readonly #page: SheetPage;
    readonly #sheet: Sheet;
    readonly column: number;
    
    constructor (sheet: Sheet, page: SheetPage, column: number) {
        this.#sheet = sheet;
        this.#page = page;
        this.column = column;
    }

    pos (row: number) {
        return Vec3(this.column, row, this.#page.page);
    }

    all () {
        return this.#sheet.readRange(this.pos(0), this.pos(MAX_ROWS));
    }

    allFrom (row: number) {
        return this.#sheet.readRange(this.pos(row), this.pos(MAX_ROWS));
    }
}