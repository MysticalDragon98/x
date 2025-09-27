import { Project } from "@/src/modules/projects/project";
import { Shell } from "@/src/modules/shell/shell";
import debug from "debug";

const log = debug("@projects/rust");

export default class RustProject extends Project {
    name = "rust";

    async init () {
        const cwd = this.workdirSubpath();
        log(`Initializing rust project`);
        await Shell.exec("cargo init --bin", { cwd });
    }

}