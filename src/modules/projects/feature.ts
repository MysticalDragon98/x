import debug from "debug";
import { Project } from "./project";
import { cp, mkdir } from "fs/promises";
import { join } from "path";

export abstract class Feature<P extends Project> {

    readonly project: P;
    readonly log;

    readonly #dependencies: Feature<any>[] = [];

    constructor (project: P) {
        this.project = project;
        this.log = debug(`@features/${this.name()}`);
    }

    abstract init (): void | Promise<void>;
    abstract name (): string;
    abstract version (): string;

    async setup ({ update = false } = {}) {
        this.log(`Setting up feature ${this.name()}`);
        if (this.#dependencies.length > 0) {
            this.log(`Feature ${this.name()} has ${this.#dependencies.length} dependencies, installing...`);
            await this.#setupDependencies();
        }

        if (await this.isInstalled({ update })) {
            this.log(`Feature ${this.name()} is already installed`);
            return;
        }

        this.log(`Feature ${this.name()} is not installed, installing...`);

        await this.#setupScaffolding();
        await this.init();
        await this.project.setFeatureVersion(this.name(), this.version());
    }

    async metaSubpath (...paths: string[]) {
        return join(await this.project.metaPath(), ...paths);
    }

    inject<T extends Feature<P>>(FeatureClass: new (project: P) => T): T {
        const feature = new FeatureClass(this.project);
        this.#dependencies.push(feature);
        return feature;
    }
    
    async #setupDependencies () {
        for (const dependency of this.#dependencies) {
            await dependency.setup();
        }
    }

    async isInstalled ({ update = false } = {}) {
        const config = await this.project.config().read();

        if (update) return config.features[this.name()] === this.version();
        
        return !!config.features[this.name()];
    }

    featureSubpath (...paths: string[]) {
        return this.project.projectSubpath("features", this.name(), ...paths);
    }

    workdirFeatureSubpath (...paths: string[]) {
        return this.project.workdirSubpath("features", this.name(), ...paths);
    }

    async #setupScaffolding () {
        await cp(this.featureSubpath("scaffolding"), this.project.workdirSubpath(), { recursive: true }).catch(() => {});
        await mkdir(await this.metaSubpath(), { recursive: true });
    }

}