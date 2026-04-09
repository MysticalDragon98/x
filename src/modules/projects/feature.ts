import debug from "debug";
import { Project } from "./project";
import { cp, mkdir, readdir, readFile, writeFile, stat } from "fs/promises";
import { join, dirname } from "path";
import picomatch from "picomatch";
import { StringUtils } from "../utils/string-utils";
import { TextFile } from "../files/text-file";

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

    updatePaths (): string[] {
        return [];
    }

    async update ({ bump = "patch" }: { bump?: "patch" | "minor" | "major" } = {}) {
        this.log(`Updating scaffolding for feature ${this.name()}`);

        const patterns = this.updatePaths();
        if (patterns.length === 0) {
            this.log(`Feature ${this.name()} has no updatePaths defined, skipping`);
            return { updated: 0, version: this.version(), skipped: true };
        }

        const files = await this.#resolveUpdateFiles();

        for (const { workdirPath, scaffoldingPath } of files) {
            await mkdir(dirname(scaffoldingPath), { recursive: true });
            await cp(workdirPath, scaffoldingPath);
        }

        const newVersion = StringUtils.bumpVersion(this.version(), bump);
        await this.#bumpVersionInSource(newVersion);
        await this.project.setFeatureVersion(this.name(), newVersion);

        this.log(`Updated ${files.length} files, version: ${this.version()} -> ${newVersion}`);
        return { updated: files.length, version: newVersion, skipped: false };
    }

    async #resolveUpdateFiles (): Promise<{ workdirPath: string, scaffoldingPath: string }[]> {
        const patterns = this.updatePaths();
        if (patterns.length === 0) return [];

        const includePatterns = patterns.filter(p => !p.startsWith("!"));
        const excludePatterns = patterns.filter(p => p.startsWith("!")).map(p => p.slice(1));

        const isIncluded = picomatch(includePatterns);
        const isExcluded = excludePatterns.length > 0 ? picomatch(excludePatterns) : () => false;

        const scaffoldingDir = this.featureSubpath("scaffolding");
        const workdir = this.project.workdirSubpath();

        // Extract base directories from include patterns to avoid scanning the entire workdir
        const baseDirs = new Set<string>();
        for (const pattern of includePatterns) {
            const base = picomatch.scan(pattern).base || ".";
            baseDirs.add(base);
        }

        const resolvedFiles: { workdirPath: string, scaffoldingPath: string }[] = [];

        for (const baseDir of baseDirs) {
            const scanDir = join(workdir, baseDir);
            let entries: string[];
            try {
                entries = (await readdir(scanDir, { recursive: true })) as string[];
            } catch { continue; }

            for (const entry of entries) {
                const fullPath = join(scanDir, entry);
                try {
                    const stats = await stat(fullPath);
                    if (!stats.isFile()) continue;
                } catch { continue; }

                const relativePath = join(baseDir, entry);

                if (isIncluded(relativePath) && !isExcluded(relativePath)) {
                    resolvedFiles.push({
                        workdirPath: fullPath,
                        scaffoldingPath: join(scaffoldingDir, relativePath)
                    });
                }
            }
        }

        return resolvedFiles;
    }

    async #bumpVersionInSource (newVersion: string) {
        const featureFilePath = this.featureSubpath(`${this.name()}.feature.ts`);
        const content = await readFile(featureFilePath, "utf-8");

        const updated = content.replace(
            /(version\s*\(\)\s*\{[^}]*return\s*["'])([^"']+)(["'])/,
            `$1${newVersion}$3`
        );

        await writeFile(featureFilePath, updated);
    }

    async addInitializer (importLine: string, initCall: string) {
        const indexFile = new TextFile(this.project.workdirSubpath("index.ts"));
        await indexFile.insertTagLine("Imports", importLine);
        await indexFile.insertTagLine("Initialize", initCall);
    }

    async #setupScaffolding () {
        await cp(this.featureSubpath("scaffolding"), this.project.workdirSubpath(), { recursive: true }).catch(() => {});
        await mkdir(await this.metaSubpath(), { recursive: true });
    }

}