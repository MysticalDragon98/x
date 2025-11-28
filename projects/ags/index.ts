import { Project } from "@/src/modules/projects/project";
import { Shell } from "@/src/modules/shell/shell";
import debug from "debug";

const log = debug("@projects/ags");

export default class AgsProject extends Project {

    name = "ags";

    constructor (readonly folder: string, readonly workdir: string) {
        super(folder, workdir);
    }

    async init () {
        const cwd = this.workdirSubpath();

        log(`Initializing ags project in ${cwd}`);

        const env = await this.feature("env");
        await env.setup();

        await env.addEnvvar("InstanceName", { required: true });
    }

}