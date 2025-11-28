import { Vec3, Vector3 } from "../../geometry/classes/vector3";
import { Sheet } from "./sheet";

export class SheetsCursor {
    
    readonly #sheet: Sheet;
    readonly pos: Vector3;

    constructor (sheet: Sheet, pos: Vector3) {
        this.#sheet = sheet;
        this.pos = pos;
    }

    read () {
        return this.#sheet.read(this.pos);
    }

    down () {
        this.pos.add(Vec3(0, 1, 0));
    }

    up () {
        this.pos.add(Vec3(0, -1, 0));
    }

    left () {
        this.pos.add(Vec3(-1, 0, 0));
    }

    right () {
        this.pos.add(Vec3(1, 0, 0));
    }

}