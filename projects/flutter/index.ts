import { Project } from "@/src/modules/projects/project";
import { Shell } from "@/src/modules/shell/shell";
import debug from "debug";

const log = debug("@projects/flutter");

export default class FlutterProject extends Project {
    name = "flutter";
    
    constructor (readonly folder: string, readonly workdir: string) {
        super(folder, workdir);
    }

    async init () {
        const cwd = this.workdirSubpath();
        log(`Initializing flutter project`);

        await Shell.exec("flutter create --empty .", { cwd });
    }
}