import { $assert, CustomErrors } from "@/features/errors";
import { Vector3 } from "../../geometry/classes/vector3";
import { Sheet } from "./sheet";
import GoogleSheetsModule from "..";

const Errors = CustomErrors({
    SheetRangeInvalid: "The start and end points must be in the same sheet"
});

export class SheetRange {
    
    readonly #sheet: Sheet;
    constructor (sheet: Sheet, public start: Vector3, public end: Vector3) {
        $assert(start.z === end.z, Errors.SheetRangeInvalid);
        
        this.#sheet = sheet;
    }

    async read () {
        $assert(this.start.z === this.end.z, Errors.SheetRangeInvalid);

        return await this.#sheet.readRange(this.start, this.end);
    }
}