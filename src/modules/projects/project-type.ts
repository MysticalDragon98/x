import { statSync } from "fs";
import { Cache } from "../cache/cache";
import { join, resolve } from "path";
import { $assert, $throw } from "../errors";
import { bold, green } from "chalk";
import { Project } from "./project";

const Errors = {
    ProjectTypeNotFound: { ProjectTypeNotFound: "The project type {projectType} was not found." },
    InvalidProjectTypeName: { InvalidProjectTypeName: "The project type {projectType} is not a valid project type." },
    InvalidProjectType: { InvalidProjectType: "No entry point found for project type {projectType}." },
    InvalidProjectTypeInitializer: { InvalidProjectTypeInitializer: "The project type {projectType} initializer is not an instance of Project." }   
}

const projectsPath = resolve(__dirname, "../../../projects");
export class ProjectType {
    static readonly existsCache = new Cache<boolean>();
    readonly path: string;

    constructor (readonly name: string) {
        $assert(typeof name === "string", Errors.InvalidProjectTypeName, { projectType: name });

        const valid = ProjectType.existsCache.get(name, () => {
            try {
                statSync(join(projectsPath, name));
                return true;
            } catch (exc: any) {
                return false;
            }
        });

        $assert(valid, Errors.ProjectTypeNotFound, { projectType: name });

        this.path = join(projectsPath, name);
    }

    toString () {
        return bold(green(this.name));
    }

    async loadProject (workdir: string) {
        const indexPath = join(this.path, "index.ts");

        try {
            var module = await import(indexPath);
        } catch (exc: any) {
            $throw(Errors.InvalidProjectType, { projectType: this.name });
        }
        
        $assert(module.default?.prototype instanceof Project, Errors.InvalidProjectTypeInitializer, { projectType: this.name });
        
        return new module.default(this.path, workdir);
    }
}