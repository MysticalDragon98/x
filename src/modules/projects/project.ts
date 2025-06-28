import { cp, mkdir, stat } from "fs/promises";
import { join } from "path";
import { JSONFile } from "../files/json-file";
import { $assert, $throw } from "../errors";
import { Feature } from "./feature";
import { ProjectType } from "./project-type";

const Errors = {
    FeatureNotFound: { FeatureNotFound: "The feature {feature} was not found in the project type {projectType}." },
    InvalidFeatureName: { InvalidFeatureName: "The name {feature} is not a valid feature name." },
    InvalidFeature: { InvalidFeature: "The exported feature {feature} in the project type {projectType} is not an instance of Feature." }
}

export abstract class Project {

    abstract name: string;
    abstract init () : void | Promise<void>;

    constructor (readonly folder: string, readonly workdir: string) {}

    async setup () {
        await this.#initProjectJSON();
        await this.#setupScaffolding();
        await this.init();
    }

    projectSubpath (...paths: string[]) {
        return join(this.folder, ...paths);
    }

    workdirSubpath (...paths: string[]) {
        return join(this.workdir, ...paths);
    }

    config () {
        return new JSONFile(this.workdirSubpath("project.json"));
    }

    async metaPath () {
        const config = await this.config().read();
        
        return config.folders.metadata;
    }

    async feature (name: string) {
        const path = this.projectSubpath("features", name);
        const indexPath = this.projectSubpath("features", name, `${name}.feature.ts`);
        
        $assert(typeof name === "string", Errors.InvalidFeatureName, { feature: name });

        try {
            var stats = await stat(path);
        } catch (exc: any) {
            $throw(Errors.FeatureNotFound, { feature: name, projectType: this.name });
        }

        try {
            var module = await import(indexPath);
        } catch (exc: any) {
            console.log(exc);
            $throw(Errors.FeatureNotFound, { feature: name, projectType: this.name });
        }
        
        $assert(module.default?.prototype instanceof Feature, Errors.InvalidFeature, { feature: name, projectType: this.name });
        
        return new module.default(this);
    }


    async setFeatureVersion (featureName: string, version: string) {
        await this.config().map((data) => {
            data.features[featureName] = version;

            return data;
        });
    }

    async #setupScaffolding () {
        await cp(this.projectSubpath("scaffolding"), this.workdirSubpath(), { recursive: true });
        await mkdir(this.workdirSubpath(".meta"), { recursive: true });
    }

    async #initProjectJSON () {
        const projectJSON = new JSONFile(this.workdirSubpath("project.json"));

        await projectJSON.write({
            type: this.name,
            features: {

            },
            folders: {
                metadata: ".meta"
            }
        });
    }

    static async fromFolder (folder: string): Promise<Project | null> {
        const projectJSON: { type: string } = await JSONFile.read(join(folder, "project.json"), null);
        const projectType = projectJSON && new ProjectType(projectJSON.type);
        const project = projectType && await projectType.loadProject(folder);

        return project ?? null;
    }
}