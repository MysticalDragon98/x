import { Vector2 } from "../../geometry/classes/vector2";
import { Vec3 } from "../../geometry/classes/vector3";
import { Sheet } from "./sheet";
import { SheetColumn } from "./sheet-column";

export class SheetPage {
    
    readonly #sheet: Sheet;
    readonly page: number;

    constructor (sheet: Sheet, page: number) {
        this.#sheet = sheet;
        this.page = page;
    }

    cursor (pos: Vector2) {
        return this.#sheet.cursor(Vec3(pos.x, pos.y, this.page));
    }

    column (column: number) {
        return new SheetColumn(this.#sheet, this, column);
    }

}