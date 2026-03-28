import { CLIResult } from "@/src/modules/cli/cli-result";
import TypescriptProject from "@/projects/typescript";
import StorageFeature from "../storage.feature";
import { StorageRepo, StorageItemType } from "../classes/storage-repo";
import { DepParser } from "../classes/dep-parser";

async function uploadOne(
    name: string,
    moduleName: string,
    type: StorageItemType,
    feature: StorageFeature,
    repo: StorageRepo,
    visited: Set<string>,
    warnings: string[]
): Promise<void> {
    const key = `${type}:${name}`;
    if (visited.has(key)) return;
    visited.add(key);

    const content = await Bun.file(feature.sourcePath(moduleName, name, type)).text();

    const entityDeps = DepParser.parseEntityDeps(content);
    const dataTypeDeps = DepParser.parseDataTypeDeps(content);

    for (const dep of entityDeps) {
        const depType = await feature.detectType(moduleName, dep);
        if (!depType) {
            warnings.push(`Dependency "${dep}" not found in module "${moduleName}", skipping`);
            continue;
        }
        await uploadOne(dep, moduleName, depType, feature, repo, visited, warnings);
    }

    for (const dep of dataTypeDeps) {
        const depType = await feature.detectType(moduleName, dep);
        if (!depType) {
            warnings.push(`Dependency "${dep}" not found in module "${moduleName}", skipping`);
            continue;
        }
        await uploadOne(dep, moduleName, depType, feature, repo, visited, warnings);
    }

    await repo.writeSource(name, type, content);
    await repo.writeMeta({
        name,
        type,
        deps: {
            entities: entityDeps,
            dataTypes: dataTypeDeps,
        },
    });
}

export default async function uploadCommand(
    [moduleName, name]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: StorageFeature }
): Promise<CLIResult> {
    if (!moduleName || !name) {
        return CLIResult.error({ MissingArguments: "Both moduleName and name arguments are required" });
    }

    const moduleExists = await feature.std.config.existsModule(moduleName);
    if (!moduleExists) {
        return CLIResult.error({ ModuleNotFound: `Module "${moduleName}" not found` });
    }

    const type = await feature.detectType(moduleName, name);
    if (!type) {
        return CLIResult.error({ NotFound: `"${name}" not found as entity or data-type in module "${moduleName}"` });
    }

    const repo = new StorageRepo(feature.storagePath());
    const warnings: string[] = [];

    await uploadOne(name, moduleName, type, feature, repo, new Set(), warnings);

    return CLIResult.success(
        `✨ Successfully uploaded ${type} "${name}" from module "${moduleName}"!`,
        { name, type, moduleName, storagePath: repo.root, warnings }
    );
}
